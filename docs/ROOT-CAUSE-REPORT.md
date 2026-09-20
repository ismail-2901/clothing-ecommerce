# ELARIS Root Cause Diagnostic Report

## 1. Executive Summary
This diagnostic report establishes the baseline health of the ELARIS application, details environmental and architectural bottlenecks, and identifies critical vulnerabilities discovered through reproducible integration, concurrency, and security testing against a real PostgreSQL instance.

---

## 2. Baseline Verification Matrix

| Step / Command | Target Layer | Result | Key Diagnostics & Evidence |
| :--- | :--- | :--- | :--- |
| `npm ci` | Dependencies | **PASSED** | Clean installation, 571 packages installed, Prisma client generated via postinstall hook. |
| `prisma generate` | ORM Codegen | **PASSED** | Generated Prisma Client v7.10.0 to `node_modules/@prisma/client` in ~450ms. |
| `prisma migrate deploy` (default `127.0.0.1:5432`) | Database | **FAILED** | `Error: P1001: Can't reach database server at 127.0.0.1:5432`. Windows TCP port exclusion range conflict (5361–5460) blocked port 5432. |
| `prisma migrate deploy` (dedicated test db `127.0.0.1:15432`) | Database | **PASSED** | Successfully applied migrations `20260902165854_init`, `20260902170205_add_account_issuer`, `20260903093835_add_otp_fields`. |
| `npx tsc --noEmit` | Source Code | **PASSED** | Zero TypeScript compilation errors. |
| `npm run lint` | Code Quality | **PASSED** | Zero errors; 13 ESLint warnings (`react-hooks/set-state-in-effect` and `@next/next/no-page-custom-font`). |
| `npm run test` (Vitest) | Test Suite | **PASSED** | 27 test files, 130 tests passed in 19.95s (13 unit suites + 14 integration, concurrency, security, and resilience suites). |
| `npm run build` | Next.js Build | **WARNING** | Build completed, but database connection errors (`P1001`) were logged during SSG page generation for `/sitemap.xml` and `/(storefront)/offers`. |

---

## 3. Detailed Baseline Failures & Root Cause Analysis

### Failure 1: Database Connection Failure on Default Port 5432
* **Exact Command**: `npx prisma migrate deploy`
* **Exact Error**:
  ```text
  Error: P1001: Can't reach database server at 127.0.0.1:5432
  Please make sure your database server is running at 127.0.0.1:5432.
  ```
* **Affected Layer**: Environment / Database
* **Root Cause**: On Windows systems with Hyper-V or WSL2 container networking enabled, dynamic TCP exclusion ranges (`netsh interface ipv4 show excludedportrange protocol=tcp`) reserved ports 5361 through 5460. Attempting to bind any local service to 5432 failed with `could not bind IPv4 address 127.0.0.1: Permission denied`.
* **Resolution for Diagnostic Phase**: Configured a dedicated PostgreSQL instance on port `15432` outside the reserved range, enabling clean execution of Prisma migrations and tests.

---

### Failure 2: Silent Database Masking during Production Build (`npm run build`)
* **Exact Command**: `npm run build`
* **Exact Error**:
  ```text
  prisma:error Invalid `prisma.product.findMany()` invocation:
  Can't reach database server at 127.0.0.1:5432
  [catalog:db] Error [PrismaClientKnownRequestError]: Can't reach database server at 127.0.0.1:5432
      at async getAllProducts (features/catalog/data.ts:160:24)
      at async sitemap (app/sitemap.ts:9:20)
  ```
* **Affected Layer**: Source / Architecture
* **Root Cause**: Next.js App Router prerenders static routes (`/sitemap.xml`, `/offers`) during `next build`. `features/catalog/data.ts` caught database exceptions and returned empty arrays `[]` instead of throwing or providing graceful offline build handling. While this prevented the build process from crashing, it masked database outages and produced incomplete static sitemaps.

---

### Failure 3: Migration Drift — Missing `guestToken` on `Order` Table
* **Exact Command**: `tx.order.create({ data: { guestToken: "...", ... } })`
* **Exact Error**:
  ```text
  PrismaClientKnownRequestError: 
  The column `guestToken of relation Order` does not exist in the current database.
  ```
* **Affected Layer**: Database / Migration
* **Root Cause**: `prisma/schema.prisma` defines `guestToken String? @unique` on model `Order`, and `app/api/orders/route.ts` and `app/api/orders/[id]/route.ts` explicitly read and write `guestToken`. However, no Prisma migration SQL file was created to add `guestToken` to the database schema. Deploying the existing migration history produces a database schema that throws runtime errors whenever a guest order is processed.

---

### Failure 4: Parallel Test Execution TRUNCATE Deadlock
* **Exact Command**: `npm run test` (concurrent Vitest files)
* **Exact Error**:
  ```text
  PrismaClientKnownRequestError: 
  Raw query failed. Code: 40P01. Message: deadlock detected
  ```
* **Affected Layer**: Test Configuration
* **Root Cause**: Vitest ran all integration test files in parallel across worker threads. Each file executed `TRUNCATE TABLE ... CASCADE` during setup against the same test database, triggering PostgreSQL transaction deadlocks and race conditions.
* **Resolution**: Configured `fileParallelism: false` in `vitest.config.ts` so integration tests run in controlled sequence against PostgreSQL.
