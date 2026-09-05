import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60; // seconds — large uploads can be slow

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

function sign(params: Record<string, string>): string {
  // Cloudinary spec: SHA1(sorted_params_string + api_secret) — NOT HMAC
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "elaris-products";

  const signature = sign({ folder, timestamp });

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", API_KEY);
  uploadForm.append("timestamp", timestamp);
  uploadForm.append("folder", folder);
  uploadForm.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: uploadForm }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message ?? JSON.stringify(err) ?? "Upload failed.";
    console.error("[upload] Cloudinary error:", msg);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ url: data.secure_url as string });
}
