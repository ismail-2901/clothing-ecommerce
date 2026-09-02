import { prisma } from "@/db/prisma";
import type { Prisma } from "@prisma/client";

export type CustomerEventType =
  | "PRODUCT_VIEW"
  | "SEARCH"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "CHECKOUT_STARTED"
  | "CHECKOUT_ABANDONED"
  | "ORDER_CREATED"
  | "ORDER_CANCELLED"
  | "ORDER_DELIVERED"
  | "WISHLIST_ADD";

export type TrackEventInput = {
  userId: string;
  type: CustomerEventType;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Write a customer behavior event.
 * Fire-and-forget — caller should not await unless they need to ensure write.
 * Never throws; errors are swallowed to avoid breaking user flows.
 */
export async function trackCustomerEvent(input: TrackEventInput): Promise<void> {
  try {
    await prisma.customerEvent.create({
      data: {
        userId: input.userId,
        type: input.type,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue
      }
    });
  } catch {
    // Non-critical — swallow silently
  }
}

/**
 * Convenience: track event without awaiting (true fire-and-forget).
 * Use in server components / route handlers where you don't want to block.
 */
export function trackCustomerEventAsync(input: TrackEventInput): void {
  trackCustomerEvent(input).catch(() => undefined);
}
