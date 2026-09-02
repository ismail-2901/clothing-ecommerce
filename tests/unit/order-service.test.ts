import { describe, expect, it } from "vitest";
import { generateOrderNumber } from "@/features/orders/order-service";
import { canTransitionOrderStatus, transitionOrderStatus } from "@/features/orders/state-machine";

describe("order service", () => {
  it("generates unique order numbers with prefix", () => {
    const num1 = generateOrderNumber("ORD");
    const num2 = generateOrderNumber("ORD");

    expect(num1).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/);
    expect(num1).not.toEqual(num2);
  });

  it("validates order status transitions", () => {
    expect(canTransitionOrderStatus("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransitionOrderStatus("CONFIRMED", "PROCESSING")).toBe(true);
    expect(canTransitionOrderStatus("PROCESSING", "PACKED")).toBe(true);
    expect(canTransitionOrderStatus("DELIVERED", "PROCESSING")).toBe(false);
  });

  it("logs status transitions without errors", () => {
    const result = transitionOrderStatus("PENDING", "CONFIRMED");
    expect(result).toBe("CONFIRMED");
  });

  it("prevents invalid transitions", () => {
    expect(() => transitionOrderStatus("DELIVERED", "PENDING")).toThrow();
  });
});
