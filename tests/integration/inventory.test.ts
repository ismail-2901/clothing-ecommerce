import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  ensureTestDatabase,
  cleanupDatabase,
  seedCatalogFixture
} from "./test-db";

describe("Integration: Inventory Reservation & Release", () => {
  let db: PrismaClient;

  beforeAll(async () => {
    db = await ensureTestDatabase();
  });

  beforeEach(async () => {
    await cleanupDatabase(db);
  });

  it("reserves stock conditionally and creates an audit movement", async () => {
    const { variant } = await seedCatalogFixture(db);
    const reserveQty = 3;

    const affected = await db.$executeRaw`
      UPDATE "ProductVariant"
      SET "reservedQuantity" = "reservedQuantity" + ${reserveQty}
      WHERE id = ${variant.id}
        AND "isAvailable" = true
        AND "deletedAt" IS NULL
        AND ("stockQuantity" - "reservedQuantity") >= ${reserveQty}
    `;

    expect(affected).toBe(1);

    await db.inventoryMovement.create({
      data: {
        variantId: variant.id,
        type: "RESERVATION",
        quantity: reserveQty,
        reason: "Checkout reservation"
      }
    });

    const refreshed = await db.productVariant.findUnique({
      where: { id: variant.id }
    });
    expect(refreshed?.reservedQuantity).toBe(3);
    expect((refreshed?.stockQuantity ?? 0) - (refreshed?.reservedQuantity ?? 0)).toBe(7);
  });

  it("fails conditional reservation when requested quantity exceeds available stock", async () => {
    const { variant } = await seedCatalogFixture(db);
    // variant has stockQuantity = 10, reservedQuantity = 0
    const excessiveQty = 15;

    const affected = await db.$executeRaw`
      UPDATE "ProductVariant"
      SET "reservedQuantity" = "reservedQuantity" + ${excessiveQty}
      WHERE id = ${variant.id}
        AND "isAvailable" = true
        AND "deletedAt" IS NULL
        AND ("stockQuantity" - "reservedQuantity") >= ${excessiveQty}
    `;

    expect(affected).toBe(0);

    const refreshed = await db.productVariant.findUnique({
      where: { id: variant.id }
    });
    expect(refreshed?.reservedQuantity).toBe(0);
  });

  it("fails conditional reservation when variant is marked unavailable", async () => {
    const { variant } = await seedCatalogFixture(db);
    await db.productVariant.update({
      where: { id: variant.id },
      data: { isAvailable: false }
    });

    const affected = await db.$executeRaw`
      UPDATE "ProductVariant"
      SET "reservedQuantity" = "reservedQuantity" + 1
      WHERE id = ${variant.id}
        AND "isAvailable" = true
        AND "deletedAt" IS NULL
        AND ("stockQuantity" - "reservedQuantity") >= 1
    `;

    expect(affected).toBe(0);
  });

  it("releases reserved stock upon cancellation and logs a RELEASE movement", async () => {
    const { variant } = await seedCatalogFixture(db);

    // Initial reservation of 2 units
    await db.productVariant.update({
      where: { id: variant.id },
      data: { reservedQuantity: 2 }
    });

    // Release 2 units
    const releaseQty = 2;
    const affected = await db.$executeRaw`
      UPDATE "ProductVariant"
      SET "reservedQuantity" = GREATEST(0, "reservedQuantity" - ${releaseQty})
      WHERE id = ${variant.id}
    `;
    expect(affected).toBe(1);

    await db.inventoryMovement.create({
      data: {
        variantId: variant.id,
        type: "RELEASE",
        quantity: releaseQty,
        reason: "Order cancellation release"
      }
    });

    const refreshed = await db.productVariant.findUnique({
      where: { id: variant.id }
    });
    expect(refreshed?.reservedQuantity).toBe(0);

    const movements = await db.inventoryMovement.findMany({
      where: { variantId: variant.id }
    });
    expect(movements).toHaveLength(1);
    expect(movements[0].type).toBe("RELEASE");
  });
});
