# Security and Privacy

## Status and scope

This is a security-conscious reference implementation, not an OWASP ASVS assessment, API Security certification, PCI attestation, or production penetration test. The demo uses local role selection and a mock payment adapter. Production must complete the controls below and validate them against its threat model and applicable legal obligations.

## Trust boundaries and threat model

| Boundary / asset              | Threats                                                  | Reference controls                                                                      | Production-required controls                                                                           |
| ----------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Browser -> Next.js            | XSS, CSRF, session theft, abusive automation             | HttpOnly SameSite cookie, same-origin mutation check, CSP/security headers, size limits | CSP nonce validation, WAF/bot controls, robust session lifecycle and CSRF testing                      |
| Next.js proxy -> API          | SSRF/misrouting, header/cookie leakage, origin confusion | Configured API origin, selective cookie forwarding, origin validation                   | Egress policy, service identity/mTLS, gateway authorization and request signing as needed              |
| API -> PostgreSQL             | SQL injection, tenant escape, privilege abuse, data loss | Drizzle parameterization, tenant-scoped predicates, input schemas, audit entries        | DB per-service credentials, TLS, encryption/KMS, row-level policy review, backups/PITR, rotation       |
| API -> OIDC                   | Forged/expired token, issuer/JWKS substitution           | Issuer/audience/signature/time checks, HTTPS JWKS setting                               | Managed OIDC, key rotation/revocation, MFA/step-up policy, well-tested claim mapping                   |
| API -> payments               | Card-data exposure, replay, forged webhooks              | No raw card fields or PAN storage; mock adapter blocked in production                   | Hosted/tokenized PSP, provider idempotency, webhook signature/replay verification, reconciliation      |
| Outbox -> broker/consumers    | Poison/replayed event, privilege escalation, PII leakage | Transactional outbox, bounded retries, event ID                                         | mTLS/SASL, ACLs, schema registry, DLQ controls, retention/data classification and replay audit         |
| Operator/admin                | Excess privilege, insider misuse, cross-tenant access    | Operator role, tenant-scoped queries, audit log                                         | SSO/MFA, granular RBAC, approval separation, session review and immutable audit export                 |
| Recommendation/analytics data | Inference, purpose creep, consent withdrawal failure     | Coarse category only, explicit consent gates, no sensitive profiling                    | Consent lineage, deletion propagation, retention policy, model governance and re-identification review |

## Required production controls

- **Identity:** OAuth2/OIDC with exact issuer/audience/algorithm allowlists, key rotation, short-lived tokens, refresh/session revocation, MFA for operators, account recovery and secure cookie settings.
- **Authorization:** deny by default; separate shopper/operator roles; tenant context from verified claims or trusted host routing; authorization checks for every object and operation.
- **API security:** versioned contracts, strict schemas, bounded request/body and pagination limits, rate limits by authenticated subject and IP, idempotency for payment/order mutations, safe error responses, security testing against OWASP API Security Top 10.
- **Secrets and cryptography:** managed secret store, rotation, least-privilege workload identity, TLS in transit, KMS-backed encryption at rest, key separation and documented break-glass.
- **PCI scope:** accept no PAN/CVV in this platform; use hosted checkout or PSP tokens. Never log payment tokens or store raw card payloads. Complete PCI scope review with the provider/acquirer.
- **Privacy:** purpose limitation, explicit optional analytics/recommendation consent, consent withdrawal, export/deletion workflows, retention schedules, data residency and DPIA/legal review where required.
- **Operations:** structured audit events, redaction, dependency/container scanning, SBOM, signed images, protected branches, reviewed migrations, incident response and tested restore.
- **Web:** CSP, HSTS at TLS ingress, frame-ancestors, nosniff, referrer policy, secure cookies, dependency updates and accessible error states.

## Data handling rules

Never introduce raw card details, passwords, secrets, sensitive attributes, or user-generated free text into outbox payloads, logs, metrics, traces, analytics events, or recommendation features. Store only data needed for documented purposes. Treat order/address data as personal data even when the demo omits shipping addresses.

The demo recommendations use product category as coarse context only; users can withdraw consent, which clears the stored category profile. Production pipelines must propagate withdrawal and deletion across caches, event stores, feature stores, derived data, and backups according to an approved retention policy.

## Security review checklist for changes

- Is the data untrusted? Validate it at the boundary and encode it at output.
- Is the route authenticated and authorized for both action and tenant/object ownership?
- Could retry, concurrency, timeout or event replay duplicate a business effect?
- Could sensitive content reach logs, analytics, outbox payloads, browser storage or cache?
- Are secrets, webhook signatures, and provider token flows isolated and testable?
- Are migrations additive, observable, and safe for mixed old/new application versions?
- Are failures explicit and fail-closed for auth, payment and inventory authority?
