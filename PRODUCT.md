# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React, Next.js, TypeScript, Tailwind CSS, PostgreSQL/Supabase. The implementation and cloud provider details are to be selected by the builder within these constraints.

## Users

Commerce platform engineers and operators use the reference to evaluate and adapt global commerce architecture. Shoppers use the working demo storefront; operations teams use the admin demo.

## Product Purpose

Atlas Commerce is an API-first, headless commerce reference implementation that demonstrates a usable shopping and operations experience alongside scalable service boundaries and production architecture guidance.

## Positioning

Atlas pairs an executable shopper-to-order path with independently deployable domain boundaries, operational scaffolding, and explicit production assumptions rather than presenting a diagram or a single-deployment capacity claim as a production platform.

## Operating Context

Developers run and adapt the monorepo locally; shoppers browse, search, add products to a cart, place a mock order, and inspect recommendations and order history; operations users manage catalog and orders.

## Capabilities and Constraints

- The reference spans identity/profile, catalog, search, pricing/promotions, cart, checkout/orders, inventory, payments, fulfillment, customer service, notifications, recommendations/personalization, fraud/risk, and analytics/events.
- The main commerce path should be functional; remaining domains receive clear service boundaries and production integration points.
- Seed-product themes are winter fashion, jewelry, electronics, and creator merchandise.
- Provider integrations may be mocked locally and must be identified as such. Never persist raw payment card data.
- The 10M+ global-user target is an architecture and validation objective, not a capacity guarantee.
- Localization, currency, timezone, privacy/consent, and accessibility belong in the reference design; enabled locales and production policies remain configurable.

## Evidence on Hand

The requirements are the available product evidence. No customer stories, sales metrics, production deployment, compliance certification, or capacity test results have been supplied; do not fabricate them.

## Product Principles

- Make core commerce flows executable and testable.
- Keep domain ownership and API contracts explicit.
- Fail safely and label simulated integrations.
- Minimize sensitive data and make automated decisions explainable.
- Document assumptions and validate scale claims empirically.

## Accessibility & Inclusion

Build accessible responsive web interfaces with semantic structure, keyboard support, visible focus, and clear recovery states; support international formatting and consent-aware personalization.
