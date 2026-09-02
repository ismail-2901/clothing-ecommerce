# Production Architecture

This project is a single-brand clothing e-commerce platform. It is not a
marketplace and intentionally excludes vendor accounts, seller dashboards,
commissions, marketplace rankings, and multi-seller workflows.

## 1. Complete Architecture

The application is a modular Next.js full-stack system:

- Next.js App Router handles public storefront pages, customer account pages,
  admin pages, route handlers, server actions, SEO metadata, and streaming UI.
- PostgreSQL is the system of record for products, inventory, customers, carts,
  checkout, orders, discounts, reviews, notifications, analytics, audit logs,
  AI conversations, and risk assessments.
- Prisma owns schema, migrations, typed data access, constraints, indexes, and
  transaction boundaries.
- Better Auth owns identity, sessions, email/password login, verification,
  password reset, OAuth extension points, and stronger admin authentication.
- Redis is used for rate limits, short-lived checkout state, background queues,
  cacheable AI responses, and hot catalog metadata.
- The service layer owns business operations. React components do not calculate
  critical pricing, stock, authorization, payment, or order transitions.
- AI is provider-agnostic and receives structured, validated inputs. It can
  interpret customer intent, retrieve store knowledge, and rank real products,
  but it cannot invent prices, inventory, order states, discounts, or payment
  results.
- Payment gateways are isolated behind a provider interface. Cash on Delivery is
  the local baseline, with SSLCommerz, bKash, Nagad, and cards enabled by config
  when merchant credentials exist.
- Object storage stores product media. PostgreSQL stores only metadata, ordering,
  alt text, dimensions, and storage keys.

## 2. Technology Decisions

- Framework: Next.js 16 App Router with React 19 and TypeScript strict mode.
- Styling: Tailwind CSS 4 with centralized tokens in CSS variables and reusable
  UI primitives.
- Components: Accessible custom components using Radix-compatible patterns where
  needed, styled to match a premium black/white fashion brand.
- Database: PostgreSQL.
- ORM: Prisma pinned to the latest stable line available before the current RC
  tag.
- Validation: Zod for all request bodies, params, query state, forms, AI
  structured outputs, and admin actions.
- Auth: Better Auth.
- Tests: Vitest for unit/integration logic and Playwright for browser flows.
- Icons: lucide-react for buttons, admin navigation, and utility actions.
- Deployment target: horizontally scalable Node runtime with external Postgres,
  Redis, image storage, email, payment, AI provider, and monitoring.

## 3. Folder Structure

```text
app/
  (storefront)/
  (account)/
  admin/
  api/
components/
  ai/
  cart/
  checkout/
  layout/
  product/
  ui/
config/
db/
features/
  account/
  admin/
  analytics/
  auth/
  cart/
  checkout/
  discounts/
  inventory/
  orders/
  products/
  risk/
  search/
  wishlist/
lib/
  ai/
  auth/
  errors/
  payments/
  rate-limit/
  security/
  utils/
prisma/
  schema.prisma
  seed.ts
public/
schemas/
server/
  actions/
  api/
  services/
  repositories/
tests/
  e2e/
  integration/
  unit/
types/
```

## 4. Database ERD / Model Plan

Core identity:

- `User`, `Session`, `Account`, `Verification`
- `Role`, `Permission`, `UserRole`, `RolePermission`
- `Address`

Catalog:

- `Category` with parent category support for subcategories
- `Collection`
- `Product`, `ProductVariant`, `ProductImage`, `ProductTag`
- `InventoryMovement`
- `Review`

Shopping:

- `Cart`, `CartItem`
- `Wishlist`, `WishlistItem`
- `Coupon`, `Discount`, `Promotion`

Checkout and orders:

- `Order`, `OrderItem`, `OrderStatusHistory`
- `Payment`, `Refund`, `Shipment`
- `AbandonedCheckout`

Analytics, AI, and support:

- `CustomerEvent`
- `Conversation`, `ConversationMessage`
- `AIRecommendation`
- `RiskAssessment`, `RiskSignal`
- `Notification`, `SupportTicket`

Operations:

- `AuditLog`
- `StoreSetting`
- `HomepageSection`
- `FAQ`

The first schema keeps the domain normalized while avoiding premature
over-modeling. High-risk shared entities use UUID primary keys, foreign keys,
unique constraints, indexes for common filters, soft-delete timestamps where
appropriate, and created/updated timestamps.

## 5. Authentication Architecture

- Better Auth manages secure sessions with HttpOnly cookies.
- Customers can register, verify email, reset passwords, and check out as guests.
- Guest orders can later be claimed by a verified account using secure proof.
- Admin routes require authenticated sessions and explicit role permission checks.
- Admin accounts support stricter session expiry and optional 2FA/passkeys later.
- Auth route handlers validate all inputs and apply Redis-backed rate limits.

## 6. Authorization Matrix

| Capability | Customer | Admin | Super Admin |
| --- | --- | --- | --- |
| Manage own profile | Yes | Yes | Yes |
| Manage own cart/wishlist | Yes | Yes | Yes |
| Place orders | Yes | Yes | Yes |
| View own orders | Yes | Yes | Yes |
| Manage products | No | Yes | Yes |
| Manage inventory | No | Yes | Yes |
| Manage orders | No | Yes | Yes |
| Manage offers/coupons | No | Yes | Yes |
| View customer analytics | No | Yes | Yes |
| Review risk assessments | No | Yes | Yes |
| Manage admins | No | No | Yes |
| Manage roles/permissions | No | No | Yes |
| View audit logs | No | Limited | Yes |
| System configuration | No | Limited | Yes |

Every protected server action and route handler checks authorization server-side.

## 7. Order State Machine

Allowed statuses:

```text
PENDING
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
CANCELLED
RETURN_REQUESTED
RETURNED
REFUNDED
FAILED_DELIVERY
```

Status transitions are explicit:

- `PENDING -> CONFIRMED | CANCELLED`
- `CONFIRMED -> PROCESSING | CANCELLED`
- `PROCESSING -> PACKED | CANCELLED`
- `PACKED -> SHIPPED | CANCELLED`
- `SHIPPED -> OUT_FOR_DELIVERY | FAILED_DELIVERY`
- `OUT_FOR_DELIVERY -> DELIVERED | FAILED_DELIVERY`
- `DELIVERED -> RETURN_REQUESTED`
- `RETURN_REQUESTED -> RETURNED | REFUNDED`
- `RETURNED -> REFUNDED`

Each transition writes an `OrderStatusHistory` row with previous status, new
status, actor, timestamp, and optional note.

## 8. Pricing / Discount Engine Design

The pricing engine is deterministic and server-side:

- Load product variant prices, active discounts, eligible coupons, promotions,
  shipping methods, tax settings, and customer context.
- Validate active dates, usage limits, minimum spend, product/category/collection
  eligibility, and stackability.
- Calculate subtotal, item discounts, coupon discounts, shipping, tax if enabled,
  and grand total in integer minor currency units.
- Never accept client-submitted prices, discounts, totals, or coupon values.
- Persist a price snapshot into order items at order creation.

## 9. Inventory Design

- Stock is tracked at `ProductVariant` level, not as separate unrelated products.
- Available stock equals `stockQuantity - reservedQuantity`.
- Checkout uses a database transaction to validate stock, reserve inventory, and
  create the order.
- Payment failure, cancellation, and expired reservations release stock.
- `InventoryMovement` records adjustments, reservations, releases, sales, returns,
  and manual admin changes.

## 10. Payment Abstraction

`PaymentProvider` exposes:

- `createPayment`
- `verifyPayment`
- `refundPayment`
- `handleWebhook`

Providers are configured independently:

- Cash on Delivery
- SSLCommerz
- bKash
- Nagad
- Card provider

Frontend redirects never confirm payment alone. Server-side verification and
idempotent webhook handling are authoritative.

## 11. AI Architecture

`lib/ai` contains provider-neutral modules:

- `providers`
- `schemas`
- `intent`
- `recommendation`
- `deals`
- `comparison`
- `support`
- `risk`
- `retrieval`
- `guardrails`

AI receives constrained context, returns structured JSON, and is validated with
Zod. Application code uses the structured result to query the database and apply
business rules. The database and deterministic services remain the source of
truth.

## 12. Risk Scoring Architecture

Risk scoring is explainable and advisory:

- Scores range from 0 to 100.
- Levels: low `0-29`, medium `30-59`, high `60-79`, critical `80-100`.
- Signals include failed deliveries, COD refusals, cancellation frequency, return
  frequency, payment failures, unusual order velocity, repeated contact/address
  patterns, and order-value anomalies.
- Protected or sensitive characteristics are never used.
- The admin UI shows score, level, signals, related orders, and recommended
  review actions.
- The system never labels a person as a fraudster and never makes irreversible
  decisions purely from AI.

## 13. API / Route Structure

Public pages:

- `/`
- `/shop`
- `/category/[slug]`
- `/products/[slug]`
- `/offers`
- `/about`
- `/contact`
- `/faq`
- `/shipping`
- `/returns`
- `/privacy`
- `/terms`

Customer pages:

- `/account`
- `/account/orders`
- `/account/orders/[id]`
- `/account/profile`
- `/account/addresses`
- `/account/wishlist`
- `/account/notifications`
- `/account/security`
- `/account/support`
- `/track/[orderNumber]`

Admin pages:

- `/admin`
- `/admin/orders`
- `/admin/products`
- `/admin/inventory`
- `/admin/categories`
- `/admin/offers`
- `/admin/customers`
- `/admin/abandoned-checkouts`
- `/admin/risk`
- `/admin/reviews`
- `/admin/analytics`
- `/admin/notifications`
- `/admin/content`
- `/admin/admins`
- `/admin/audit-logs`
- `/admin/settings`

Route handlers:

- `/api/auth/[...all]`
- `/api/cart`
- `/api/cart/items`
- `/api/checkout`
- `/api/orders`
- `/api/payments/[provider]/webhook`
- `/api/search`
- `/api/ai/chat`
- `/api/ai/match`
- `/api/admin/*`

## 14. UI / Page Map

Storefront:

- Compact announcement bar and sticky header.
- Fast homepage with hero, current collection, dynamic categories, active offers,
  curated products, AI assistant entry, trust section, newsletter, and footer.
- URL-driven shop filters for category, subcategory, collection, price, size,
  color, availability, discount, and search.
- Product listing with desktop filter panel and mobile bottom-sheet filters.
- Product details with gallery, variant-aware price/stock/SKU/images, size guide,
  delivery/return details, reviews, wishlist, add to cart, buy now, and AI help.
- Cart with server-side recalculation, coupon validation, shipping estimate, and
  clear totals.
- Guest-friendly checkout with contact, address, shipping, payment, review, and
  confirmation.
- Account area for profile, addresses, orders, wishlist, notifications, security,
  and support conversations.

## 15. Admin Page Map

Admin:

- Operational dashboard for revenue, orders, customers, abandoned checkouts,
  conversion, average order value, low stock, active offers, and risk queue.
- Product CRUD with images, categories, variants, inventory, status, tags, and SEO.
- Inventory view with low stock, reservations, movement history, and adjustments.
- Order management with status updates, payment state, shipment state, notes, and
  audit logging.
- Offers/coupons management with eligibility rules, limits, and scheduling.
- Customer management with segmentation, behavior metrics, and privacy-conscious
  event history.
- Abandoned checkout analytics by stage, product, value, and recency.
- Risk center with explainable signals and manual review actions.
- Content management for FAQs, homepage sections, policies, and store settings.
- Admin management and audit logs for super admins.

## 16. Testing Strategy

- Unit tests cover pricing, discounts, cart totals, inventory availability,
  order state transitions, risk scoring, validation, and permission checks.
- Integration tests cover Prisma repositories, order creation transactions,
  inventory reservation, coupons, payment provider contracts, auth guards, and
  admin authorization.
- E2E tests cover customer registration/login, browse, search, product detail,
  variant selection, cart, coupon, checkout, order tracking, admin product CRUD,
  admin discount creation, admin order updates, risk visibility, and abandoned
  checkout visibility.
- Build gates: typecheck, lint, unit tests, integration tests, Playwright tests,
  production build, and migration validation.

## 17. Deployment Architecture

```text
Customer/Admin
  -> CDN / edge hosting
  -> Next.js application
  -> Service layer
  -> PostgreSQL
  -> Redis
  -> Object storage
  -> Email provider
  -> Payment providers
  -> AI provider
  -> Monitoring / error tracking
```

The application expects external stateful services in production and must not
depend on local filesystem persistence for product media or production data.

## 18. Environment Variable List

```text
DATABASE_URL=
DIRECT_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_APP_URL=
REDIS_URL=
AI_PROVIDER=
AI_PROVIDER_API_KEY=
AI_MODEL_CHAT=
AI_MODEL_CLASSIFIER=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_PROVIDER=
EMAIL_FROM=
EMAIL_API_KEY=
PAYMENT_COD_ENABLED=
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=
NAGAD_MERCHANT_ID=
CARD_PROVIDER_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
ADMIN_2FA_REQUIRED=
STORE_CURRENCY=BDT
STORE_LOCALE=en-BD
ORDER_PREFIX=ORD
```

Business-specific values such as legal policy text, brand assets, payment
credentials, shipping fees, tax rules, and email templates remain configurable
placeholders until supplied by the merchant.
