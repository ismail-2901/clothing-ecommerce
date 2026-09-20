# ELARIS Test Harness Failures & Unpatched Schema Diagnostics

This document catalogs every real test-harness failure, schema drift symptom, and regression failure discovered after removing all synthetic test-harness patches and executing against the clean PostgreSQL database.

---

## 1. Schema Drift: Missing `guestToken` on `Order` Table (BUG-01)

### Exact Command
`npx vitest run tests/integration/order.test.ts`

### Exact Error
```
PrismaClientKnownRequestError: 
Invalid `db.order.create()` invocation:
The column `guestToken of relation Order` does not exist in the current database.
  code: 'P2022',
  meta: {
    modelName: 'Order',
    driverAdapterError: DriverAdapterError: ColumnNotFound
  }
```

### Root Cause & Impact
In Phase C, a manual test-harness patch (`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "guestToken" TEXT;`) was added to `tests/integration/test-db.ts`. 
Per Phase D instructions, this patch was **completely removed**. The test database is now created strictly by deploying committed migrations via `npx prisma migrate deploy`.

Because `prisma/migrations/` contains only 3 migrations and none added `guestToken` to `Order`, the database schema lacks `Order.guestToken`. As a result, every application route that reads or writes `Order.guestToken` crashes:
1. `tests/integration/order.test.ts`: Guest order creation fails.
2. `tests/integration/concurrency-idempotency.test.ts`: `POST /api/orders` crashes on `tx.order.create()`.
3. `tests/integration/rbac.test.ts`: `PATCH /api/admin/orders/[id]/status` crashes on `prisma.order.findUnique()` because Prisma includes all scalar fields by default.
4. `tests/integration/payment.test.ts`: `prisma.payment.findFirst({ include: { order: true } })` crashes when joining `Order`.
5. `tests/e2e/checkout.spec.ts`: Checkout order submission fails with HTTP 500 on unmigrated databases.

---

## 2. Concurrency Race: Duplicate Active Carts (BUG-02)

### Exact Command
`npx vitest run tests/integration/concurrency-cart.test.ts`

### Exact Error
```
AssertionError: expected [ { ... }, { ... }, { ... }, { ... }, { ... } ] to have a length of 1 but got 5

- Expected: 1
+ Received: 5
```

### Root Cause & Impact
`app/api/cart/route.ts` implements cart resolution using a non-atomic pattern:
```typescript
let cart = await prisma.cart.findFirst({ where: { anonymousId, status: "ACTIVE" } });
if (!cart) {
  cart = await prisma.cart.create({ data: { anonymousId, status: "ACTIVE" } });
}
```
Because `prisma/schema.prisma` lacks a unique constraint on `(anonymousId, status)`, 10 concurrent requests from the same user created **5 distinct active carts** in PostgreSQL. The regression test strictly asserts `expect(activeCarts).toHaveLength(1)` and fails, proving the concurrency vulnerability.

---

## 3. Concurrency Gap: Order Idempotency (BUG-03)

### Exact Command
`npx vitest run tests/integration/concurrency-idempotency.test.ts`

### Exact Error
```
PrismaClientKnownRequestError: 
Invalid `tx.order.create()` invocation:
The column `guestToken of relation Order` does not exist in the current database.
```

### Root Cause & Impact
In the previous phase, `concurrency-idempotency.test.ts` tested a simulated in-memory `Map` rather than the real application. In Phase D, the test was rewritten to send 10 concurrent HTTP requests with the identical `Idempotency-Key` header to `POST /api/orders`. 
`app/api/orders/route.ts` lacks any server-side idempotency validation or storage. Both the schema drift and the lack of idempotency deduplication are confirmed.

---

## 4. Payment Webhook Security Vulnerabilities (BUG-12 & BUG-14)

### Exact Command
`npx vitest run tests/integration/payment.test.ts`

### Exact Errors
1. **Wrong Amount Tampering (BUG-12)**:
   ```
   AssertionError: expected 200 to be 422
   - Expected: 422
   + Received: 200
   ```
   *Explanation*: An attacker sends an inbound webhook reporting ৳100 paid for an order of ৳2060. The route accepts it and returns HTTP 200 because `app/api/payments/webhook/[provider]/route.ts` never validates that `webhookResult.amount === payment.amount`.

2. **Provider Mismatch (BUG-14)**:
   ```
   AssertionError: expected 500 to be 422
   - Expected: 422
   + Received: 500
   ```
   *Explanation*: An incoming webhook targeting `/api/payments/webhook/bkash` for an order originally billed via `SSLCOMMERZ` is not rejected with a 422 client error, but triggers an unhandled database error.

---

## 5. Summary of Diagnostic Status

All 5 reproduced failures are **true baseline failures** that reflect the actual, unpatched production codebase. In strict compliance with instructions:
- **No business logic was patched or modified.**
- **No synthetic schema alterations were executed.**
- **All tests invoke real route handlers and real PostgreSQL tables.**
- **These failing tests serve as the authoritative regression proof for Phase E remediation.**
