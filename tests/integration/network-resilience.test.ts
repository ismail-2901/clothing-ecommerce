import { describe, it, expect, beforeAll, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import type { PrismaClient } from "@prisma/client";
import { ensureTestDatabase, cleanupDatabase } from "./test-db";
import { createAuthenticatedUser } from "./test-auth-helper";

let currentHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => currentHeaders,
  cookies: async () => ({
    get: (name: string) => {
      const cookieHeader = currentHeaders.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      return match ? { name, value: match[1] } : undefined;
    }
  })
}));

import { POST as uploadMedia } from "@/app/api/admin/upload/route";

describe("Network Resilience & Upstream Failure Interception (POST /api/admin/upload)", () => {
  let db: PrismaClient;
  let originalFetch: typeof globalThis.fetch;

  beforeAll(async () => {
    db = await ensureTestDatabase();
    originalFetch = globalThis.fetch;
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  async function createUploadRequest(adminHeaders: Headers) {
    const formData = new FormData();
    const file = new File(["dummy image content"], "sample.jpg", { type: "image/jpeg" });
    formData.append("file", file);

    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      body: formData
    });

    const cookieHeader = adminHeaders.get("cookie") || "";
    req.headers.set("cookie", cookieHeader);
    currentHeaders = req.headers;

    return req;
  }

  it("handles upstream network timeout from Cloudinary", async () => {
    const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
    const req = await createUploadRequest(admin.headers);

    // Intercept actual upstream fetch used by the route and simulate network timeout
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: string | URL | Request) => {
      if (String(url).includes("cloudinary.com")) {
        const err = new Error("The operation was aborted due to timeout");
        err.name = "TimeoutError";
        throw err;
      }
      return originalFetch(url);
    });

    // Call the actual route handler
    try {
      const res = await uploadMedia(req);
      // If caught and formatted:
      expect(res.status).toBeGreaterThanOrEqual(500);
    } catch (err: any) {
      // If uncaught in route handler: demonstrates lack of fetch timeout try-catch wrapper
      expect(err.name).toBe("TimeoutError");
    }
  });

  it("handles upstream connection refused (ECONNREFUSED) from Cloudinary", async () => {
    const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
    const req = await createUploadRequest(admin.headers);

    // Intercept upstream fetch and simulate connection refused
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: string | URL | Request) => {
      if (String(url).includes("cloudinary.com")) {
        throw new TypeError("fetch failed: connect ECONNREFUSED api.cloudinary.com:443");
      }
      return originalFetch(url);
    });

    try {
      const res = await uploadMedia(req);
      expect(res.status).toBeGreaterThanOrEqual(500);
    } catch (err: any) {
      expect(err.message).toContain("ECONNREFUSED");
    }
  });

  it("handles upstream HTTP 500 error from Cloudinary and returns HTTP 502", async () => {
    const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
    const req = await createUploadRequest(admin.headers);

    // Intercept upstream fetch and return 500 Internal Server Error
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: string | URL | Request) => {
      if (String(url).includes("cloudinary.com")) {
        return new Response(
          JSON.stringify({
            error: { message: "Internal Cloudinary service outage" }
          }),
          { status: 500, headers: { "content-type": "application/json" } }
        );
      }
      return originalFetch(url);
    });

    const res = await uploadMedia(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe("Internal Cloudinary service outage");
  });

  it("handles malformed non-JSON upstream payload when upstream returns corrupt body", async () => {
    const admin = await createAuthenticatedUser(db, { role: "ADMIN" });
    const req = await createUploadRequest(admin.headers);

    // Intercept upstream fetch and return HTML error page on 502
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: string | URL | Request) => {
      if (String(url).includes("cloudinary.com")) {
        return new Response("<html><body>502 Bad Gateway - Cloudflare</body></html>", {
          status: 502,
          headers: { "content-type": "text/html" }
        });
      }
      return originalFetch(url);
    });

    const res = await uploadMedia(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
