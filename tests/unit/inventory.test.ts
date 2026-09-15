import { describe, expect, it } from "vitest";
import {
  availableQuantity,
  commitSale,
  InventoryError,
  releaseInventory,
  reserveInventory,
  restoreReturn
} from "@/features/inventory/inventory";

describe("inventory reservations", () => {
  it("reserves stock without overselling", () => {
    const reserved = reserveInventory(
      { sku: "ALS-BLK-M", stockQuantity: 10, reservedQuantity: 4 },
      { sku: "ALS-BLK-M", quantity: 6 }
    );

    expect(availableQuantity(reserved)).toBe(0);
    expect(reserved.reservedQuantity).toBe(10);
  });

  it("rejects reservations that exceed availability", () => {
    expect(() =>
      reserveInventory(
        { sku: "ALS-BLK-M", stockQuantity: 10, reservedQuantity: 4 },
        { sku: "ALS-BLK-M", quantity: 7 }
      )
    ).toThrow(InventoryError);
  });

  it("releases reserved stock safely", () => {
    const released = releaseInventory(
      { sku: "ALS-BLK-M", stockQuantity: 10, reservedQuantity: 4 },
      { sku: "ALS-BLK-M", quantity: 10 }
    );

    expect(released.reservedQuantity).toBe(0);
  });
});

describe("inventory full order lifecycle", () => {
  const base = { sku: "ALS-BLK-M", stockQuantity: 20, reservedQuantity: 0 };
  const req = { sku: "ALS-BLK-M", quantity: 3 };

  it("reserve → commitSale: stock and reservation both decrement", () => {
    const reserved = reserveInventory(base, req);
    // stock=20, reserved=3, available=17
    expect(reserved.reservedQuantity).toBe(3);

    const delivered = commitSale(reserved, req);
    // stock=17, reserved=0, available=17
    expect(delivered.stockQuantity).toBe(17);
    expect(delivered.reservedQuantity).toBe(0);
    expect(availableQuantity(delivered)).toBe(17);
  });

  it("commitSale → restoreReturn: stock goes back up, reservation stays 0", () => {
    const delivered = commitSale(reserveInventory(base, req), req);
    const returned = restoreReturn(delivered, req);
    // stock=17+3=20, reserved=0
    expect(returned.stockQuantity).toBe(20);
    expect(returned.reservedQuantity).toBe(0);
  });

  it("direct RETURN_REQUESTED → REFUNDED path: same as restoreReturn", () => {
    // After DELIVERED: stock=17, reserved=0
    const delivered = { sku: "ALS-BLK-M", stockQuantity: 17, reservedQuantity: 0 };
    const restored = restoreReturn(delivered, req);
    expect(restored.stockQuantity).toBe(20);
    expect(restored.reservedQuantity).toBe(0);
  });

  it("commitSale does not double-decrement reservedQuantity below 0", () => {
    // Edge: reserved already 0 (shouldn't happen in production but must not go negative)
    const snap = { sku: "ALS-BLK-M", stockQuantity: 17, reservedQuantity: 0 };
    const after = commitSale(snap, req);
    expect(after.reservedQuantity).toBe(0);
  });

  it("rejects SKU mismatch on commitSale", () => {
    expect(() =>
      commitSale(base, { sku: "WRONG-SKU", quantity: 1 })
    ).toThrow(InventoryError);
  });

  it("rejects SKU mismatch on restoreReturn", () => {
    expect(() =>
      restoreReturn(base, { sku: "WRONG-SKU", quantity: 1 })
    ).toThrow(InventoryError);
  });
});
