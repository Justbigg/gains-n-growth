# Contributing

Thanks for helping improve Atlas Commerce. This repository is a reference implementation, not a production capacity or compliance certification.

## Development setup

1. Install Node.js 22 or newer and pnpm 12.
2. Copy `.env.example` to `.env` and review each local-only setting.
3. Start PostgreSQL with `docker compose up -d postgres`.
4. Install dependencies with `pnpm install`.
5. Apply migrations and seed demo data with `pnpm db:migrate && pnpm db:seed`.
6. Run `pnpm verify` before opening a pull request.

## Pull requests

- Keep changes within a domain boundary and update its API contract and docs.
- Add or update tests for behavior and validation changes.
- Never add credentials, raw payment data, personal data dumps, or production secrets.
- Label simulated integrations and document production configuration requirements.
- Describe migration impact, security/privacy impact, and rollback considerations.

## Reporting issues

Include a minimal reproduction, expected behavior, actual behavior, and relevant sanitized logs. Do not attach customer data or secrets.
