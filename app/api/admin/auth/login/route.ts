import { NextResponse } from "next/server";

/**
 * Admin login is now handled by Better Auth email+password sign-in.
 * Redirect any legacy POST to the Better Auth sign-in endpoint.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is deprecated. Sign in via Better Auth at /api/auth/sign-in/email."
    },
    { status: 410 }
  );
}
