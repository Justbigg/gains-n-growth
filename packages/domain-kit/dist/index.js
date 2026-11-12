import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
const portSchema = z.coerce.number().int().min(1).max(65535);
export async function createDomainService(domain, version = 'v1') {
    const server = Fastify({
        bodyLimit: 64 * 1024,
        logger: {
            level: process.env.LOG_LEVEL ?? 'info',
            redact: {
                paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.cardNumber'],
                censor: '[REDACTED]',
            },
        },
    });
    await server.register(helmet);
    await server.register(rateLimit, { max: 120, timeWindow: '1 minute' });
    server.get('/health/live', async () => ({ status: 'ok' }));
    server.get('/health/ready', async () => ({
        status: 'ready',
        domain,
        implementation: 'scaffold',
    }));
    server.get('/internal/service-info', async () => ({
        domain,
        apiVersion: version,
        implementation: 'scaffold',
        productionAdapterRequired: true,
    }));
    return server;
}
export async function startDomainService(domain, defaultPort) {
    const port = portSchema.parse(process.env.PORT ?? String(defaultPort));
    const host = process.env.HOST ?? '127.0.0.1';
    const server = await createDomainService(domain);
    const shutdown = async (signal) => {
        server.log.info({ signal }, 'Shutting down domain service');
        await server.close();
    };
    process.once('SIGINT', () => void shutdown('SIGINT'));
    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    await server.listen({ port, host });
}
