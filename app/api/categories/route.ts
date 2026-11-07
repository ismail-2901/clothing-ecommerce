import { NextResponse } from "next/server";
import { getCachedCategories } from "@/lib/cache/db-cache";

export const revalidate = 300;

export async function GET() {
  try {
    const categories = await getCachedCategories();
    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("[api:categories:GET]", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
