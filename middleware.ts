/**
 * Priority-5: Edge Middleware — auth guard runs BEFORE the request hits Node.js.
 *
 * This protects /admin/* and /account/* at the edge without a DB round-trip.
 * better-auth uses an HTTP-only cookie ("better-auth.session_token") to identify
 * sessions. We check the cookie exists as a lightweight pre-screen; the actual
 * role check (DB query for user roles) still happens inside each API/page handler
 * via requireAdminSession(). This two-layer design means:
 *
 *  - Unauthenticated requests are rejected at the CDN edge with zero DB load.
 *  - Role verification happens inside the handler where we have full DB access.
 *
 * NOTE: Edge middleware cannot import Node.js modules (fs, crypto heavy APIs).
 * Keep this file import-free from server libraries.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require the user to be authenticated (session cookie present)
const AUTH_REQUIRED_PATTERNS = [
  /^\/account(\/|$)/,
  /^\/api\/orders(\/|$)/,
  /^\/api\/wishlist(\/|$)/,
  /^\/api\/checkout(\/|$)/,
];

// Paths that require admin role — we do a lightweight cookie check here
// and rely on requireAdminSession() inside the handler for the role DB check
const ADMIN_REQUIRED_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/api\/admin(\/|$)/,
];

// better-auth session cookie name (matches nextCookies() plugin default)
const SESSION_COOKIE = "better-auth.session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  const isAdminPath = ADMIN_REQUIRED_PATTERNS.some((re) => re.test(pathname));
  const isAuthPath  = AUTH_REQUIRED_PATTERNS.some((re) => re.test(pathname));

  // ── Admin path guard ──────────────────────────────────────────────────────
  if (isAdminPath && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth-required path guard ──────────────────────────────────────────────
  if (isAuthPath && !sessionCookie) {
    const isApiRoute = pathname.startsWith("/api/");
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Security headers — applied to every response ──────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

export const config = {
  // Run middleware on all paths EXCEPT Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|eot)).*)"
  ]
};