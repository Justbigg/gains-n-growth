import { z } from 'zod';

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
  }),
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  url: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, cache: 'no-store' });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        'The commerce API is unavailable. Start PostgreSQL and the API, then try again.',
        503,
        'api_unavailable',
      );
    }
    throw error;
  }

  if (response.status === 204) {
    return schema.parse(undefined);
  }

  const body: unknown = await response.json();
  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(body);
    throw new ApiError(
      parsedError.success ? parsedError.data.error.message : 'The API request failed.',
      response.status,
      parsedError.success ? parsedError.data.error.code : 'request_failed',
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError('The API returned an invalid response.', 502, 'invalid_api_response');
  }
  return parsed.data;
}

function validateProxyRequest(request: Request, path: string[], maximumRequestBytes: number): Response | undefined {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const requestOrigin = request.headers.get('origin');
    if (!requestOrigin || new URL(request.url).origin !== requestOrigin) {
      return Response.json(
        { error: { code: 'invalid_origin', message: 'Cross-origin mutations are not allowed.' } },
        { status: 403 },
      );
    }
  }

  if (path.length === 0 || path.some((segment) => segment === '.' || segment === '..')) {
    return Response.json(
      { error: { code: 'invalid_path', message: 'Invalid API route.' } },
      { status: 400 },
    );
  }

  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > maximumRequestBytes) {
    return Response.json(
      { error: { code: 'request_too_large', message: 'Request body exceeds 64 KiB.' } },
      { status: 413 },
    );
  }
}

function proxyRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  for (const name of ['accept', 'authorization', 'content-type', 'cookie', 'idempotency-key']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

async function proxyRequestBody(
  request: Request,
  maximumRequestBytes: number,
): Promise<string | Response | undefined> {
  if (['GET', 'HEAD'].includes(request.method)) return undefined;

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maximumRequestBytes) {
    return Response.json(
      { error: { code: 'request_too_large', message: 'Request body exceeds 64 KiB.' } },
      { status: 413 },
    );
  }
  return body;
}

function proxyResponseHeaders(upstream: Response): Headers {
  const responseHeaders = new Headers({ 'cache-control': 'no-store' });
  const contentType = upstream.headers.get('content-type');
  if (contentType) responseHeaders.set('content-type', contentType);
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append('set-cookie', cookie);
  }
  return responseHeaders;
}

export async function proxyApiRequest(
  request: Request,
  apiOrigin: string,
  path: string[],
): Promise<Response> {
  const maximumRequestBytes = 64 * 1024;
  const validationError = validateProxyRequest(request, path, maximumRequestBytes);
  if (validationError) return validationError;

  const baseUrl = new URL(apiOrigin);
  if (!['http:', 'https:'].includes(baseUrl.protocol)) {
    throw new Error('API_BASE_URL must use HTTP or HTTPS.');
  }
  const target = new URL(
    `/v1/${path.map((segment) => encodeURIComponent(segment)).join('/')}`,
    baseUrl,
  );
  target.search = new URL(request.url).search;

  const headers = proxyRequestHeaders(request);
  const body = await proxyRequestBody(request, maximumRequestBytes);
  if (body instanceof Response) return body;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(body === undefined ? {} : { body }),
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch (error) {
    console.error('Commerce API proxy failed.', error);
    return Response.json(
      { error: { code: 'api_unavailable', message: 'The commerce API is unavailable.' } },
      { status: 502 },
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: proxyResponseHeaders(upstream),
  });
}
