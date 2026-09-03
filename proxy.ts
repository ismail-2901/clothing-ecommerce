import { NextResponse, type NextRequest } from "next/server";

import { isValidAdminSession } from "@/lib/auth/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /api/admin/* endpoints (except auth routes like /api/admin/auth/login and migration endpoints)
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth") &&
    !pathname.startsWith("/api/admin/fix-sizes")
  ) {
    const token = request.cookies.get("admin_session")?.value;
    if (!isValidAdminSession(token)) {
      return NextResponse.json({ error: "Unauthorized admin access." }, { status: 401 });
    }
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  if (request.nextUrl.protocol === "https:") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
