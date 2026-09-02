import { describe, expect, it } from "vitest";
import {
  canTransitionOrderStatus,
  OrderStateError,
  transitionOrderStatus
} from "@/features/orders/state-machine";

describe("order state machine", () => {
  it("allows explicit forward transitions", () => {
    expect(canTransitionOrderStatus("PENDING", "CONFIRMED")).toBe(true);
    expect(transitionOrderStatus("CONFIRMED", "PROCESSING")).toBe("PROCESSING");
  });

  it("rejects invalid status jumps", () => {
    expect(() => transitionOrderStatus("PENDING", "DELIVERED")).toThrow(OrderStateError);
  });
});

