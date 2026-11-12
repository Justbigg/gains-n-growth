# Atlas Commerce Project Guidelines

## Context

Atlas Commerce is a MACH-oriented commerce reference implementation. The API currently composes domain modules into one deployable service; the `services/*` packages are independently runnable health-only scaffolds, not production business services. Treat the 10M+ global-user target as a capacity-planning objective, never as measured or guaranteed capacity.

## Architecture and boundaries

- Keep storefront and admin clients headless: use versioned contracts from `packages/contracts` and the shared client in `packages/api-client`.
- Keep business rules in domain modules or service boundaries, not in UI components or route handlers. Routes validate input, authorize, call domain logic, and return explicit errors.
- Keep tenant scoping in every data access path. Do not trust a tenant identifier supplied by a browser.
- Make domain integrations replaceable through adapters. Mark mock providers and incomplete service scaffolds plainly; do not make a mock look production-capable.
- Use the transactional outbox for external events. Consumers must tolerate at-least-once delivery and deduplicate by event ID.

## Security and privacy

- Never add credentials, raw payment card data, or sensitive profiling. Use provider tokenization and secret-manager references.
- Require authentication and role checks for private/operator APIs; check ownership and tenant boundaries on each request.
- Use idempotency keys for retryable checkout mutations. Validate input with shared schemas, use parameterized SQL, and return safe errors.
- Honor optional analytics and recommendation consent; recommendations may use coarse product-category signals only.
- Do not cache account, cart, checkout, or personalized responses in shared caches or the service worker.
- Update the threat model and security guidance when changing auth, payment, tenancy, data retention, or trust boundaries.

## Implementation and verification

- Preserve strict TypeScript settings and existing package patterns. Prefer small, typed modules and accessible semantic UI.
- Add tests for changed business rules, API validation, authorization, idempotency, and failure paths. Run targeted package checks, then `pnpm verify` when practical.
- Update `docs/`, OpenAPI contracts, migrations, and `.env.example` when the behavior or operations contract changes.
- Keep migrations forward-compatible (expand/contract); never assume a production schema can be rolled back by reverting application code.
- Report unverified behavior and infrastructure prerequisites. A successful typecheck is not evidence of database, deployment, scale, or compliance readiness.

## Project references

- [README.md](./README.md) — local setup, commands, deployment entry points, and limitations.
- [docs/architecture.md](./docs/architecture.md) — service boundaries, diagrams, event and cache patterns.
- [docs/database.md](./docs/database.md) — schema ownership and production data separation.
- [docs/operations.md](./docs/operations.md) — SLOs, capacity assumptions, deployment, and recovery.
- [docs/security.md](./docs/security.md) — trust boundaries, threat model, and production controls.
- [services/api/openapi.yaml](./services/api/openapi.yaml) — current API contract.
