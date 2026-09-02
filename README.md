# Elaris

A production-oriented, single-brand clothing e-commerce platform built with
Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Better Auth, and a
provider-neutral AI service layer.

The project is intentionally being built in phases. The current codebase lays
down the architecture, app foundation, domain model, critical service logic, and
test scaffolding without pretending incomplete flows are production-complete.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment placeholders:

```bash
cp .env.example .env
```

3. Fill `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and
   `NEXT_PUBLIC_APP_URL`.

4. Generate Prisma client:

```bash
npm run db:generate
```

5. Create a migration once PostgreSQL is available:

```bash
npm run db:migrate
```

6. Seed development data:

```bash
npm run db:seed
```

7. Start local development:

```bash
npm run dev
```

## Quality Gates

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Run browser tests after installing Playwright browsers:

```bash
npm run test:e2e
```

## Production Configuration

Real deployment requires merchant-specific values for brand assets, products,
legal policies, shipping rules, payment credentials, email credentials, object
storage credentials, Redis, PostgreSQL, AI provider keys, and monitoring.

## Admin Setup

Seed data creates placeholder roles and example admin records. Replace seed
credentials before any public deployment and require stronger admin
authentication in production.

## Payment Configuration

Payment integrations are configured behind the provider interface in
`lib/payments`. Cash on Delivery can be enabled without credentials. SSLCommerz,
bKash, Nagad, and cards require merchant credentials and server-side webhook
verification before payment status changes are trusted.

## AI Configuration

The default AI implementation is deterministic and catalog-grounded for local
development. A production LLM provider can be added behind `lib/ai/providers`
without moving pricing, stock, order, or discount authority out of the database.

