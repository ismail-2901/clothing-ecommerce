export type InventorySnapshot = {
  sku: string;
  stockQuantity: number;
  reservedQuantity: number;
};

export type InventoryRequest = {
  sku: string;
  quantity: number;
};

export class InventoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryError";
  }
}

export function availableQuantity(snapshot: InventorySnapshot) {
  return Math.max(0, snapshot.stockQuantity - snapshot.reservedQuantity);
}

export function assertCanReserve(snapshot: InventorySnapshot, request: InventoryRequest) {
  if (snapshot.sku !== request.sku) {
    throw new InventoryError("Inventory SKU mismatch.");
  }

  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    throw new InventoryError("Reservation quantity must be positive.");
  }

  if (availableQuantity(snapshot) < request.quantity) {
    throw new InventoryError("Insufficient stock for this variant.");
  }
}

export function reserveInventory(
  snapshot: InventorySnapshot,
  request: InventoryRequest
): InventorySnapshot {
  assertCanReserve(snapshot, request);

  return {
    ...snapshot,
    reservedQuantity: snapshot.reservedQuantity + request.quantity
  };
}

export function releaseInventory(
  snapshot: InventorySnapshot,
  request: InventoryRequest
): InventorySnapshot {
  if (snapshot.sku !== request.sku) {
    throw new InventoryError("Inventory SKU mismatch.");
  }

  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    throw new InventoryError("Release quantity must be positive.");
  }

  return {
    ...snapshot,
    reservedQuantity: Math.max(0, snapshot.reservedQuantity - request.quantity)
  };
}

/**
 * DELIVERED: moves qty from reserved into sold.
 * Both stockQuantity and reservedQuantity decrease by the same amount.
 */
export function commitSale(
  snapshot: InventorySnapshot,
  request: InventoryRequest
): InventorySnapshot {
  if (snapshot.sku !== request.sku) {
    throw new InventoryError("Inventory SKU mismatch.");
  }
  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    throw new InventoryError("Commit quantity must be positive.");
  }

  return {
    ...snapshot,
    stockQuantity: Math.max(0, snapshot.stockQuantity - request.quantity),
    reservedQuantity: Math.max(0, snapshot.reservedQuantity - request.quantity)
  };
}

/**
 * RETURNED / REFUNDED: physical goods back in warehouse.
 * Only stockQuantity increases; reservedQuantity was already zeroed at DELIVERED.
 */
export function restoreReturn(
  snapshot: InventorySnapshot,
  request: InventoryRequest
): InventorySnapshot {
  if (snapshot.sku !== request.sku) {
    throw new InventoryError("Inventory SKU mismatch.");
  }
  if (!Number.isInteger(request.quantity) || request.quantity < 1) {
    throw new InventoryError("Restore quantity must be positive.");
  }

  return {
    ...snapshot,
    stockQuantity: snapshot.stockQuantity + request.quantity
  };
}

export type SellableVariantInput = {
  isAvailable?: boolean | null;
  stockQuantity?: number | null;
  reservedQuantity?: number | null;
  deletedAt?: Date | string | null;
  product?: {
    status?: string | null;
    deletedAt?: Date | string | null;
  } | null;
};

/**
 * Authoritative predicate for sellable variants:
 * 1. Variant must not be soft-deleted.
 * 2. Variant isAvailable flag must not be false.
 * 3. Parent product (if present) must be PUBLISHED and not soft-deleted.
 * 4. Effective stock (stockQuantity - reservedQuantity) must be greater than 0.
 */
export function isSellableVariant(
  variant: SellableVariantInput,
  product?: { status?: string | null; deletedAt?: Date | string | null } | null
): boolean {
  if (variant.deletedAt !== null && variant.deletedAt !== undefined) return false;
  if (variant.isAvailable === false) return false;

  const parentProduct = product ?? variant.product;
  if (parentProduct) {
    if (parentProduct.deletedAt !== null && parentProduct.deletedAt !== undefined) return false;
    if (parentProduct.status !== undefined && parentProduct.status !== null && parentProduct.status !== "PUBLISHED") {
      return false;
    }
  }

  const stock = variant.stockQuantity ?? 0;
  const reserved = variant.reservedQuantity ?? 0;
  return stock - reserved > 0;
}

/**
 * Standard Prisma query where condition for sellable variants.
 */
export const sellableVariantWhere = {
  deletedAt: null,
  isAvailable: true,
  stockQuantity: { gt: 0 },
  product: {
    deletedAt: null,
    status: "PUBLISHED" as const
  }
};

