import { describe, expect, it } from "vitest";
import { availableQuantity, InventoryError, releaseInventory, reserveInventory } from "@/features/inventory/inventory";

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

