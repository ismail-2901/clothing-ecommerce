import { NextResponse, type NextRequest } from "next/server";

// Paths that require the user to be authenticated (session cookie present)
const AUTH_REQUIRED_PATTERNS = [
  /^\/account(\/|$)/,
  /^\/api\/wishlist(\/|$)/,
];

// Paths that require admin role.
//
// CRIT-02 Defence-in-depth model (two independent layers):
//   Layer 1 (here): unauthenticated filter — any request without a session
//     cookie is redirected to /login or gets a 401.  This is a cheap, fast
//     guard that never touches the database.
//   Layer 2 (handlers + layout): authoritative check — requireAdminSession()
//     in every /api/admin handler, and admin/layout.tsx via getServerUser(),
//     both query the DB to confirm the user holds ADMIN or SUPER_ADMIN role.
//     A valid customer session cookie cannot pass Layer 2.
//
// Never weaken Layer 2 checks even if Layer 1 is present.
const ADMIN_REQUIRED_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/api\/admin(\/|$)/,
];

// better-auth session cookie names (standard + production HTTPS __Secure- prefix)
const SESSION_COOKIE = "better-auth.session_token";
const SECURE_SESSION_COOKIE = "__Secure-better-auth.session_token";

function hasSessionCookie(request: NextRequest): boolean {
  // Try Next.js cookies API first
  if (request.cookies.get(SECURE_SESSION_COOKIE)?.value) return true;
  if (request.cookies.get(SESSION_COOKIE)?.value) return true;
  // Fallback: raw Cookie header (Edge runtime may not expose __Secure- cookies via .get())
  const raw = request.headers.get("cookie") ?? "";
  return raw.includes(SECURE_SESSION_COOKIE + "=") || raw.includes(SESSION_COOKIE + "=");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = hasSessionCookie(request);

  const isAdminPath = ADMIN_REQUIRED_PATTERNS.some((re) => re.test(pathname));
  const isAuthPath = AUTH_REQUIRED_PATTERNS.some((re) => re.test(pathname));

  // ── Admin path guard ──────────────────────────────────────────────────────
  if (isAdminPath && !sessionCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth-required path guard ──────────────────────────────────────────────
  if (isAuthPath && !sessionCookie) {
    if (pathname.startsWith("/api/")) {
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
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // MED-09: Secure Content-Security-Policy compatible with Next.js, Cloudinary, and Sentry
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://res.cloudinary.com https://*.sentry.io https://*.ingest.sentry.io https://generativelanguage.googleapis.com",
    "media-src 'self' https://res.cloudinary.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' https:",
    "object-src 'none'"
  ];
  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  // Run proxy on all paths EXCEPT Next.js internals and static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|eot)).*)"
  ]
};
