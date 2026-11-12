# Operations, Capacity, and Reliability

## Capacity assumptions and qualification

The 10M+ global-user objective is not a measured throughput claim. Capacity depends on traffic shape, payloads, catalog cardinality, cache hit rate, database write mix, geographic distribution, third-party latency and correctness constraints. The current reference API is a single deployment and has not been load-tested against this target.

Use these as an initial experiment envelope, not sizing promises:

| Dimension            | Initial test assumption                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Registered users     | 10M identities, synthetic and evenly/non-evenly distributed across tenants                                        |
| Daily active users   | Model 5-15% of registered accounts                                                                                |
| Peak factor          | 5-10x average traffic; include campaign burst and retry storm scenarios                                           |
| Read/write mix       | 90/10 browsing-to-mutation baseline, then separately stress cart/checkout                                         |
| Initial API profile  | 200 RPS sustained, 2x burst; scale only after observing queue, DB and tail latency                                |
| Latency goals        | Public cached reads p95 < 200 ms; API reads p95 < 300 ms; checkout p95 < 1 s excluding PSP; report p99 separately |
| Availability goal    | 99.9% monthly for customer-facing API after production dependencies and failover are validated                    |
| Data recovery target | Initial target RPO <= 5 minutes, RTO <= 60 minutes; must be proven in restore/failover exercises                  |

The first tests should use a production-like data volume, realistic skew/hot products, cache cold starts, DB connection limits, broker lag and injected downstream failures. Do not use only a uniform synthetic dataset.

### Load-test plan

1. Define journeys: anonymous catalog/search, product detail, consented recommendations, authenticated cart edits, successful checkout, and admin reads.
2. Generate synthetic accounts, tenants, 1M+ products, inventory skew, carts and order history; omit real personal data.
3. Run baseline, ramp, burst, soak (at least several hours), cold-cache, failover, broker outage, DB saturation and PSP timeout scenarios.
4. Capture end-to-end p50/p95/p99, error/timeout rate, DB pool wait/locks, query plans, CPU/memory, queue lag, outbox age and cache hit ratio.
5. Test idempotency under client retries and concurrent stock contention. Assert no duplicate order/charge and no negative available stock.
6. Publish scripts, data-generation seed, environment topology, run ID and results. Establish budgets and repeat after major architecture changes.

## SLOs and error budgets

Proposed initial objectives to ratify before launch:

- Customer API availability: 99.9% monthly, excluding planned maintenance only as contractually defined.
- Successful checkout completion (excluding customer validation and provider declines): 99.5%.
- Catalog API latency: p95 under 300 ms and p99 under 800 ms at the agreed test envelope.
- Outbox event delivery: 99% within 60 seconds; alert on oldest unpublished event age and DLQ growth.
- Recommendation availability: 99.5%; degrade to non-personalized featured products on dependency failure.

Track SLIs from user-visible requests and business outcomes. Burn-rate alerts should page for fast budget consumption and create tickets for slower burn. These are targets, not existing guarantees; validate them with dashboards and runbooks.

## Resilience and graceful degradation

- Retry only transient, idempotent operations, with bounded exponential backoff and jitter; enforce an overall deadline.
- Use circuit breakers and bulkheads around remote adapters. Never retry a payment mutation blindly without provider idempotency.
- Keep catalog available from a stale, explicitly bounded projection if search is degraded; do not accept checkout when authoritative inventory/payment state is unavailable.
- Recommendation failures fall back to non-personalized, in-stock featured products.
- Outbox workers lease events with bounded retries; move poison events to a DLQ with alert, replay and operator audit workflow.
- Make every consumer idempotent and monitor lag, retries, lease expiry and dead-letter counts.

## Kubernetes and autoscaling

`infra/k8s/` includes API Deployment/Service, readiness and liveness probes, CPU/memory requests and limits, HPA and PDB examples. `infra/helm/atlas-commerce` exposes corresponding Helm values. Production rollout should include availability zones, topology spread, network policies, namespace quotas, non-root security context, external secrets, ingress/WAF, autoscaling metrics and graceful termination.

HPA CPU is only a starting signal. Add queue lag, request concurrency, latency and domain-specific backlog metrics; KEDA may scale event consumers from Kafka lag. Use `minReplicas` to preserve warm capacity, scale-down stabilization to avoid flapping, and load-test scale-up delay. Do not autoscale DB connections beyond the managed database's safe budget.

## Multi-region, backups, and disaster recovery

- Start with stateless edge/web/API across regions and a defined write home region. Do not imply active-active writes to PostgreSQL without conflict and consistency design.
- Use a managed primary/standby database topology with tested promotion, bounded replication lag and explicit split-brain prevention.
- Replicate immutable assets globally. Replicate Kafka topics only with a documented ordering, replay and data-residency policy.
- Encrypt backups, retain PITR snapshots and protect keys separately. Run scheduled restore tests into isolated environments and verify counts/checksums.
- Target RPO <= 5 minutes and RTO <= 60 minutes initially; publish measured results and refine by business impact.
- Failover runbooks must cover traffic steering, payment-provider status, event replay/deduplication, inventory reconciliation and customer communications.

## Deployment and rollback

CI checks lint, tests, typechecks and builds; image scanning and SBOM/signing support are examples in the workflow. Deployment stages are dev -> staging -> production, with production approval via GitHub Environment protection.

1. Build an immutable image; scan, generate SBOM and sign its digest.
2. Apply backward-compatible migrations via a one-off job and verify completion.
3. Roll out canary/rolling application replicas and verify readiness, error rate and SLOs.
4. Promote traffic only after health checks and smoke tests.
5. Roll back the application image if needed; retain the additive schema. Use a forward fix for schema changes unless a separately reviewed reversible operation is safe.

## Observability

Instrument ingress, API, database client, outbox and adapters with OpenTelemetry trace context. Avoid user identifiers, email, tokens, full URLs with query strings, and payment details in telemetry. Define bounded-cardinality metrics for request latency/status, pool utilization, inventory conflicts, order transitions, idempotency replays, outbox delivery, DLQ, provider errors, and HPA saturation.

The API starts NodeSDK auto-instrumentation when `OTEL_EXPORTER_OTLP_ENDPOINT` is configured; structured Pino logs go to stdout and require an OpenTelemetry Collector log receiver/forwarder in the runtime platform. Dashboards should include customer journey SLOs, dependencies, regional health, DB load/replication, Kafka lag, cache behavior and release markers. Alert on actionable symptoms with owners and runbooks; sample traces and redact structured logs.
