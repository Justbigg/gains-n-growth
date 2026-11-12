import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError, apiRequest, proxyApiRequest } from './index';

const responseSchema = z.object({ status: z.literal('ok') });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('validates successful responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ status: 'ok' })),
    );

    await expect(apiRequest('/health', responseSchema)).resolves.toEqual({ status: 'ok' });
  });

  it('returns a safe API error for malformed success bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ status: 'unexpected' })),
    );

    await expect(apiRequest('/health', responseSchema)).rejects.toMatchObject({
      status: 502,
      code: 'invalid_api_response',
    });
  });

  it('maps network failures to an explicit unavailable error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('network failure');
      }),
    );

    await expect(apiRequest('/health', responseSchema)).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest('/health', responseSchema)).rejects.toMatchObject({
      status: 503,
      code: 'api_unavailable',
    });
  });
});

describe('proxyApiRequest', () => {
  it('forwards allowlisted headers and query while preserving upstream cookies', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () =>
        new Response(JSON.stringify({ status: 'ok' }), {
          headers: {
            'content-type': 'application/json',
            'set-cookie': 'atlas_session=token; HttpOnly; SameSite=Lax',
          },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const request = new Request('https://shop.example/api/v1/catalog/products?limit=8', {
      headers: {
        cookie: 'atlas_session=token',
        'idempotency-key': 'key-1',
      },
    });

    const response = await proxyApiRequest(request, 'https://api.example', ['catalog', 'products']);

    const [target, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(target)).toBe('https://api.example/v1/catalog/products?limit=8');
    const forwardedHeaders = new Headers(init?.headers);
    expect(forwardedHeaders.get('cookie')).toBe('atlas_session=token');
    expect(forwardedHeaders.get('idempotency-key')).toBe('key-1');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.getSetCookie()).toHaveLength(1);
  });

  it('rejects cross-origin mutations before contacting the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const request = new Request('https://shop.example/api/v1/cart/items', {
      method: 'POST',
      headers: { origin: 'https://attacker.example' },
      body: JSON.stringify({ productId: 'item', quantity: 1 }),
    });

    const response = await proxyApiRequest(request, 'https://api.example', ['cart', 'items']);

    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects oversized request bodies and traversal segments', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const oversizedRequest = new Request('https://shop.example/api/v1/events', {
      method: 'POST',
      headers: { origin: 'https://shop.example' },
      body: 'x'.repeat(65_537),
    });
    const oversizedResponse = await proxyApiRequest(oversizedRequest, 'https://api.example', [
      'events',
    ]);
    const traversalResponse = await proxyApiRequest(
      new Request('https://shop.example/api/v1'),
      'https://api.example',
      ['..', 'admin'],
    );

    expect(oversizedResponse.status).toBe(413);
    expect(traversalResponse.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
