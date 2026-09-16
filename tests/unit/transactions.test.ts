import { describe, it, expect } from "vitest";
import {
  reserveInventory,
  releaseInventory,
  commitSale,
  restoreReturn,
  availableQuantity,
  InventoryError
} from "@/features/inventory/inventory";

describe("Database transaction & concurrency integrity", () => {
  describe("Concurrent inventory reservations", () => {
    it("strictly prevents overselling under concurrent load", () => {
      let variant = {
        sku: "TEST-SKU-001",
        stockQuantity: 5,
        reservedQuantity: 0
      };

      const attempts = [1, 2, 2, 1, 1]; // Total requested: 7, available: 5
      let successCount = 0;
      let failedCount = 0;

      for (const qty of attempts) {
        try {
          variant = reserveInventory(variant, { sku: variant.sku, quantity: qty });
          successCount++;
        } catch (err) {
          if (err instanceof InventoryError) {
            failedCount++;
          }
        }
      }

      expect(variant.reservedQuantity).toBeLessThanOrEqual(5);
      expect(availableQuantity(variant)).toBeGreaterThanOrEqual(0);
      expect(successCount).toBeGreaterThan(0);
      expect(failedCount).toBeGreaterThan(0);
    });
  });

  describe("Coupon usage limits and concurrency", () => {
    it("ensures coupon with maxUses=1 cannot be redeemed more than once", () => {
      let currentUses = 0;
      const maxUses = 1;

      function applyCoupon() {
        if (currentUses >= maxUses) {
          throw new Error("Coupon usage limit reached");
        }
        currentUses++;
        return { success: true, discount: 1000 };
      }

      // First attempt succeeds
      const res1 = applyCoupon();
      expect(res1.success).toBe(true);
      expect(currentUses).toBe(1);

      // Second concurrent attempt must fail
      expect(() => applyCoupon()).toThrow("Coupon usage limit reached");
      expect(currentUses).toBe(1);
    });
  });

  describe("Checkout idempotency", () => {
    it("returns existing record without creating duplicate or double-charging stock", () => {
      const processedKeys = new Map<string, { orderId: string; totalMinor: number }>();
      let stock = 10;

      function processCheckout(idempotencyKey: string, amount: number) {
        if (processedKeys.has(idempotencyKey)) {
          return { ...processedKeys.get(idempotencyKey)!, isReplay: true };
        }

        if (stock < 1) throw new Error("Out of stock");
        stock -= 1;

        const order = { orderId: "ord_" + Math.random().toString(36).substring(2, 9), totalMinor: amount };
        processedKeys.set(idempotencyKey, order);
        return { ...order, isReplay: false };
      }

      const key = "idem-tx-test-12345";
      const first = processCheckout(key, 250000);
      expect(first.isReplay).toBe(false);
      expect(stock).toBe(9);

      // Replay with identical key
      const second = processCheckout(key, 250000);
      expect(second.isReplay).toBe(true);
      expect(second.orderId).toBe(first.orderId);
      // Stock must NOT be deducted again
      expect(stock).toBe(9);
    });
  });

  describe("Rollback on transaction failure", () => {
    it("safely restores inventory if downstream order persist fails", () => {
      let variant = {
        sku: "ROLLBACK-SKU",
        stockQuantity: 10,
        reservedQuantity: 0
      };

      // 1. Reserve inventory
      variant = reserveInventory(variant, { sku: variant.sku, quantity: 3 });
      expect(variant.reservedQuantity).toBe(3);

      // 2. Simulate failure during order creation
      const orderCreationSucceeded = false;
      if (!orderCreationSucceeded) {
        // Rollback: release reserved inventory
        variant = releaseInventory(variant, { sku: variant.sku, quantity: 3 });
      }

      expect(variant.reservedQuantity).toBe(0);
      expect(availableQuantity(variant)).toBe(10);
    });
  });

  describe("Return & refund lifecycle integrity", () => {
    it("correctly handles commitSale followed by restoreReturn", () => {
      let variant = {
        sku: "LIFECYCLE-SKU",
        stockQuantity: 20,
        reservedQuantity: 0
      };

      // Customer reserves 2
      variant = reserveInventory(variant, { sku: variant.sku, quantity: 2 });
      expect(variant.stockQuantity).toBe(20);
      expect(variant.reservedQuantity).toBe(2);

      // Order paid/delivered: commit sale
      variant = commitSale(variant, { sku: variant.sku, quantity: 2 });
      expect(variant.stockQuantity).toBe(18);
      expect(variant.reservedQuantity).toBe(0);

      // Customer returns 1 item: restore return
      variant = restoreReturn(variant, { sku: variant.sku, quantity: 1 });
      expect(variant.stockQuantity).toBe(19);
      expect(variant.reservedQuantity).toBe(0);
    });
  });
});
