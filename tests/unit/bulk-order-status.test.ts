import { describe, expect, it } from "vitest";
import {
  canTransitionOrderStatus,
  transitionOrderStatus,
  OrderStateError,
  type OrderStatus
} from "@/features/orders/state-machine";

describe("Bulk Order State Machine Validations", () => {
  it("permits valid fulfillment transitions across allowed status pairs", () => {
    // Valid standard pipeline progression
    expect(canTransitionOrderStatus("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransitionOrderStatus("CONFIRMED", "PROCESSING")).toBe(true);
    expect(canTransitionOrderStatus("PROCESSING", "PACKED")).toBe(true);
    expect(canTransitionOrderStatus("PACKED", "SHIPPED")).toBe(true);
    expect(canTransitionOrderStatus("SHIPPED", "OUT_FOR_DELIVERY")).toBe(true);
    expect(canTransitionOrderStatus("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true);

    // Permitted cancellations
    expect(canTransitionOrderStatus("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionOrderStatus("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransitionOrderStatus("PROCESSING", "CANCELLED")).toBe(true);
    expect(canTransitionOrderStatus("PACKED", "CANCELLED")).toBe(true);
    expect(canTransitionOrderStatus("FAILED_DELIVERY", "CANCELLED")).toBe(true);
  });

  it("strictly forbids backwards or invalid skipping jumps", () => {
    // Cannot skip pipeline steps
    expect(canTransitionOrderStatus("PENDING", "SHIPPED")).toBe(false);
    expect(canTransitionOrderStatus("PENDING", "DELIVERED")).toBe(false);
    expect(canTransitionOrderStatus("CONFIRMED", "DELIVERED")).toBe(false);
    expect(canTransitionOrderStatus("PROCESSING", "DELIVERED")).toBe(false);

    // Cannot transition from terminal states
    expect(canTransitionOrderStatus("CANCELLED", "CONFIRMED")).toBe(false);
    expect(canTransitionOrderStatus("CANCELLED", "PENDING")).toBe(false);
    expect(canTransitionOrderStatus("REFUNDED", "DELIVERED")).toBe(false);
    expect(canTransitionOrderStatus("REFUNDED", "PROCESSING")).toBe(false);
  });

  it("partitions a mixed-status bulk batch safely without crashing", () => {
    const orders: Array<{ id: string; status: OrderStatus }> = [
      { id: "ord-1", status: "PENDING" },
      { id: "ord-2", status: "PENDING" },
      { id: "ord-3", status: "CONFIRMED" },
      { id: "ord-4", status: "DELIVERED" },
      { id: "ord-5", status: "CANCELLED" }
    ];

    const targetStatus: OrderStatus = "CONFIRMED";

    const eligible = orders.filter((o) => canTransitionOrderStatus(o.status, targetStatus));
    const ineligible = orders.filter((o) => !canTransitionOrderStatus(o.status, targetStatus));

    // Only the 2 PENDING orders are eligible for CONFIRMED
    expect(eligible.map((o) => o.id)).toEqual(["ord-1", "ord-2"]);
    // CONFIRMED, DELIVERED, and CANCELLED cannot transition to CONFIRMED
    expect(ineligible.map((o) => o.id)).toEqual(["ord-3", "ord-4", "ord-5"]);
  });

  it("partitions bulk cancellation safely", () => {
    const orders: Array<{ id: string; status: OrderStatus }> = [
      { id: "ord-1", status: "PENDING" },
      { id: "ord-2", status: "PROCESSING" },
      { id: "ord-3", status: "PACKED" },
      { id: "ord-4", status: "DELIVERED" },
      { id: "ord-5", status: "CANCELLED" }
    ];

    const targetStatus: OrderStatus = "CANCELLED";

    const eligible = orders.filter((o) => canTransitionOrderStatus(o.status, targetStatus));
    const ineligible = orders.filter((o) => !canTransitionOrderStatus(o.status, targetStatus));

    // PENDING, PROCESSING, PACKED can be cancelled
    expect(eligible.map((o) => o.id)).toEqual(["ord-1", "ord-2", "ord-3"]);
    // DELIVERED and already CANCELLED cannot be cancelled
    expect(ineligible.map((o) => o.id)).toEqual(["ord-4", "ord-5"]);
  });
});

