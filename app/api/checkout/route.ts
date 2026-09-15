import { NextResponse } from "next/server";

/**
 * @deprecated Replaced by /api/orders.
 * All order creation is handled by a single authoritative engine at POST /api/orders.
 */
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is no longer active. Use POST /api/orders instead." },
    { status: 410 }
  );
}
