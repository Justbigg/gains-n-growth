import { z } from 'zod';
export declare const apiErrorSchema: z.ZodObject<{
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        requestId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    constructor(message: string, status: number, code: string);
}
export declare function apiRequest<T>(url: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T>;
export declare function proxyApiRequest(request: Request, apiOrigin: string, path: string[]): Promise<Response>;
