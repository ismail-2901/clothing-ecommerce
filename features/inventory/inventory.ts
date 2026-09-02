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

