# ELARIS Real Route Coverage & Verification Matrix

This matrix maps every application HTTP route handler in `app/api/` to its actual integration, concurrency, security, and resilience test coverage.

---

## Route Coverage Table

| Route Path | Method(s) | Auth / RBAC Requirement | Integration Test File | Concurrency / Resilience Test | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/api/health`** | `GET` | Public | `tests/integration/health.test.ts` | Disconnection & timeout tests | **COVERED** (Distinguishes connected, disconnected, ready, failed, pending) |
| **`/api/cart`** | `GET, POST, PATCH, DELETE` | Public (Cookie / Session) | `tests/integration/cart.test.ts` | `tests/integration/concurrency-cart.test.ts` | **COVERED** (Reproduces BUG-02 duplicate active cart race) |
| **`/api/orders`** | `POST` | Public / Customer | `tests/integration/order.test.ts` | `tests/integration/concurrency-idempotency.test.ts` | **COVERED** (Reproduces BUG-01 missing guestToken & BUG-03 idempotency gap) |
| **`/api/orders/[id]`** | `GET` | Owner / Guest / Admin | `tests/integration/order-ownership.test.ts` | Negative IDOR tests | **COVERED** (Reproduces BUG-01 on guest order lookup) |
| **`/api/payments/webhook/[provider]`** | `POST` | Signature / Secret | `tests/integration/payment.test.ts` | Forged signatures, replayed webhooks, amount mismatch | **COVERED** (Reproduces BUG-12 wrong amount & BUG-14 provider mismatch) |
| **`/api/admin/products`** | `GET, POST` | ADMIN (`product:manage`) | `tests/integration/rbac.test.ts` | 401/403 Security Matrix | **COVERED** (401 unauth, 403 customer, 200 admin, 200 super admin) |
| **`/api/admin/orders/[id]/status`** | `PATCH` | ADMIN (`order:manage`) | `tests/integration/rbac.test.ts` | 401/403 Security Matrix | **COVERED** (Reproduces BUG-01 during order lookup) |
| **`/api/admin/analytics/sales`** | `GET` | ADMIN | `tests/integration/rbac.test.ts` | 401/403 Security Matrix | **COVERED** (401 unauth, 403 customer, 200 admin) |
| **`/api/admin/upload`** | `POST` | ADMIN (`product:manage`) | `tests/integration/network-resilience.test.ts` | Upstream timeout, ECONNREFUSED, 500, corrupt payload | **COVERED** (Intercepts Cloudinary fetch upstream) |
| **`/api/wishlist`** | `GET, POST, DELETE` | Session / Customer | `tests/integration/rbac.test.ts` | 401/403 Security Matrix | **COVERED** (401 unauth, 200 customer, DB persistence verified) |
| **`/api/coupons/validate`** | `POST` | Public | `tests/integration/coupon.test.ts` | `tests/integration/concurrency-coupon.test.ts` | **COVERED** (Enforces atomic single-use limit lock) |
| **`/api/inventory`** | Database Tx | Internal / System | `tests/integration/inventory.test.ts` | `tests/integration/concurrency-inventory.test.ts` | **COVERED** (10 concurrent requests for 2 units tested) |

---

## Security Verification Layers

1. **Unauthenticated Access (401)**:
   - Verified across `/api/admin/products`, `/api/admin/orders/[id]/status`, `/api/admin/analytics/sales`, `/api/wishlist`, and `/api/payments/webhook/[provider]`.
2. **Role-Based Access Control (403)**:
   - Verified that authenticated users with `CUSTOMER` role cannot access any administrative routes.
   - Verified that `ADMIN` and `SUPER_ADMIN` credentials successfully pass authorization checks.
3. **IDOR Protection**:
   - Verified in `order-ownership.test.ts` and `/api/cart`: customer A cannot read or mutate customer B's orders or cart items.
4. **Input & Price Tampering**:
   - Authoritative prices derived strictly from PostgreSQL `ProductVariant.priceOverride` or `Product.basePrice`.
   - Shipping fee derived strictly server-side from `deliveryAddress.city` against `storePolicies`.
