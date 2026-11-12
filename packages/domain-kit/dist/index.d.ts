import { type FastifyInstance } from 'fastify';
export declare function createDomainService(domain: string, version?: string): Promise<FastifyInstance>;
export declare function startDomainService(domain: string, defaultPort: number): Promise<void>;
