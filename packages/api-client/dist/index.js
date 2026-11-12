import { z } from 'zod';
export const apiErrorSchema = z.object({
    error: z.object({
        code: z.string(),
        message: z.string(),
        requestId: z.string().optional(),
    }),
});
export class ApiError extends Error {
    status;
    code;
    constructor(message, status, code) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }
}
export async function apiRequest(url, schema, init) {
    let response;
    try {
        response = await fetch(url, { ...init, cache: 'no-store' });
    }
    catch (error) {
        if (error instanceof TypeError) {
            throw new ApiError('The commerce API is unavailable. Start PostgreSQL and the API, then try again.', 503, 'api_unavailable');
        }
        throw error;
    }
    if (response.status === 204) {
        return schema.parse(undefined);
    }
    const body = await response.json();
    if (!response.ok) {
        const parsedError = apiErrorSchema.safeParse(body);
        throw new ApiError(parsedError.success ? parsedError.data.error.message : 'The API request failed.', response.status, parsedError.success ? parsedError.data.error.code : 'request_failed');
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        throw new ApiError('The API returned an invalid response.', 502, 'invalid_api_response');
    }
    return parsed.data;
}
export async function proxyApiRequest(request, apiOrigin, path) {
    const maximumRequestBytes = 64 * 1024;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
        const requestOrigin = request.headers.get('origin');
        if (!requestOrigin || new URL(request.url).origin !== requestOrigin) {
            return Response.json({ error: { code: 'invalid_origin', message: 'Cross-origin mutations are not allowed.' } }, { status: 403 });
        }
    }
    if (path.length === 0 || path.some((segment) => segment === '.' || segment === '..')) {
        return Response.json({ error: { code: 'invalid_path', message: 'Invalid API route.' } }, { status: 400 });
    }
    const declaredLength = Number(request.headers.get('content-length') ?? '0');
    if (declaredLength > maximumRequestBytes) {
        return Response.json({ error: { code: 'request_too_large', message: 'Request body exceeds 64 KiB.' } }, { status: 413 });
    }
    const baseUrl = new URL(apiOrigin);
    if (!['http:', 'https:'].includes(baseUrl.protocol)) {
        throw new Error('API_BASE_URL must use HTTP or HTTPS.');
    }
    const target = new URL(`/v1/${path.map((segment) => encodeURIComponent(segment)).join('/')}`, baseUrl);
    target.search = new URL(request.url).search;
    const headers = new Headers();
    for (const name of ['accept', 'authorization', 'content-type', 'cookie', 'idempotency-key']) {
        const value = request.headers.get(name);
        if (value)
            headers.set(name, value);
    }
    let body;
    if (!['GET', 'HEAD'].includes(request.method)) {
        body = await request.text();
        if (new TextEncoder().encode(body).byteLength > maximumRequestBytes) {
            return Response.json({ error: { code: 'request_too_large', message: 'Request body exceeds 64 KiB.' } }, { status: 413 });
        }
    }
    let upstream;
    try {
        upstream = await fetch(target, {
            method: request.method,
            headers,
            ...(body === undefined ? {} : { body }),
            cache: 'no-store',
            redirect: 'manual',
        });
    }
    catch (error) {
        console.error('Commerce API proxy failed.', error);
        return Response.json({ error: { code: 'api_unavailable', message: 'The commerce API is unavailable.' } }, { status: 502 });
    }
    const responseHeaders = new Headers({ 'cache-control': 'no-store' });
    const contentType = upstream.headers.get('content-type');
    if (contentType)
        responseHeaders.set('content-type', contentType);
    for (const cookie of upstream.headers.getSetCookie()) {
        responseHeaders.append('set-cookie', cookie);
    }
    return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
    });
}
