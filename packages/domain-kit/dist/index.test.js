import { describe, expect, it } from 'vitest';
import { createDomainService } from './index';
describe('domain service scaffold', () => {
    it('exposes health and explicit implementation status', async () => {
        const service = await createDomainService('catalog');
        try {
            const live = await service.inject('/health/live');
            const ready = await service.inject('/health/ready');
            const info = await service.inject('/internal/service-info');
            expect(live.statusCode).toBe(200);
            expect(live.json()).toMatchObject({ status: 'ok' });
            expect(ready.json()).toMatchObject({ domain: 'catalog', implementation: 'scaffold' });
            expect(info.json()).toMatchObject({
                domain: 'catalog',
                implementation: 'scaffold',
                productionAdapterRequired: true,
            });
        }
        finally {
            await service.close();
        }
    });
});
