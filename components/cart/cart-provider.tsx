"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import {
  addCartItem,
  calculateCartSummary,
  normalizeCartItem,
  type CartItem,
  type CartItemInput
} from "@/features/cart/cart";
import type { PricingResult } from "@/features/pricing/pricing";
import { storePolicies } from "@/config/store";

const STORAGE_KEY = "elaris-cart-v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  summary: PricingResult;
  addItem: (item: CartItemInput) => Promise<void> | void;
  updateQuantity: (idOrSku: string, quantity: number) => Promise<void> | void;
  removeItem: (idOrSku: string) => Promise<void> | void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function mapApiItemToCartItem(apiItem: any): CartItem {
  return {
    id: apiItem.id,
    variantId: apiItem.variantId,
    sku: apiItem.sku,
    productId: apiItem.productId,
    name: apiItem.name || apiItem.productName || "",
    productName: apiItem.productName || apiItem.name || "",
    productSlug: apiItem.productSlug,
    size: apiItem.size,
    color: apiItem.color,
    price: apiItem.unitPrice,
    unitPrice: apiItem.unitPrice,
    quantity: apiItem.quantity,
    lineTotal: apiItem.lineTotal,
    image: apiItem.image ?? undefined,
    available: apiItem.available ?? true
  };
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => normalizeCartItem(item as CartItemInput))
      .filter((item) => (item.sku || item.variantId) && item.productId && item.name);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setItems(data.items.map(mapApiItemToCartItem));
        }
      }
    } catch (err) {
      console.error("Failed to load server cart:", err);
    }
  }, []);

  // Authoritative DB cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Sync to localStorage as optimistic UI cache
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = useCallback(
    async (item: CartItemInput) => {
      // Optimistic update
      const normalized = normalizeCartItem(item);
      setItems((current) => addCartItem(current, normalized));

      // Server DB synchronization
      if (item.variantId) {
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              variantId: item.variantId,
              quantity: Number(item.quantity) || 1
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items)) {
              setItems(data.items.map(mapApiItemToCartItem));
            }
          } else {
            await refreshCart();
          }
        } catch (err) {
          console.error("Failed to add item to DB cart:", err);
          await refreshCart();
        }
      }
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (idOrSku: string, quantity: number) => {
      // Optimistic update
      setItems((current) => {
        if (!Number.isInteger(quantity) || quantity <= 0) {
          return current.filter((item) => item.id !== idOrSku && item.sku !== idOrSku);
        }

        return current.map((item) =>
          item.id === idOrSku || item.sku === idOrSku ? { ...item, quantity } : item
        );
      });

      const target = items.find((item) => item.id === idOrSku || item.sku === idOrSku);
      const cartItemId = target?.id || (idOrSku.length > 20 ? idOrSku : undefined);

      if (cartItemId) {
        try {
          const res = await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItemId, quantity })
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items)) {
              setItems(data.items.map(mapApiItemToCartItem));
            }
          } else {
            await refreshCart();
          }
        } catch (err) {
          console.error("Failed to update item quantity in DB cart:", err);
          await refreshCart();
        }
      }
    },
    [items, refreshCart]
  );

  const removeItem = useCallback(
    async (idOrSku: string) => {
      const target = items.find((item) => item.id === idOrSku || item.sku === idOrSku);
      const cartItemId = target?.id || (idOrSku.length > 20 ? idOrSku : undefined);

      // Optimistic remove
      setItems((current) => current.filter((item) => item.id !== idOrSku && item.sku !== idOrSku));

      if (cartItemId) {
        try {
          const res = await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cartItemId })
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items)) {
              setItems(data.items.map(mapApiItemToCartItem));
            }
          } else {
            await refreshCart();
          }
        } catch (err) {
          console.error("Failed to remove item from DB cart:", err);
          await refreshCart();
        }
      }
    },
    [items, refreshCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const summary = useMemo(() => {
    const subtotal = items.reduce(
      (total, item) => total + (item.unitPrice ?? item.price) * item.quantity,
      0
    );
    // free shipping threshold in minor units (paisa): 3000 * 100 = 300000
    const thresholdMinor = storePolicies.shipping.freeThreshold * 100;
    const isFree = subtotal >= thresholdMinor;
    const shippingFee = items.length > 0 && !isFree ? storePolicies.shipping.insideDhakaFee * 100 : 0;

    return calculateCartSummary({
      items,
      shippingFee
    });
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      summary,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart
    }),
    [addItem, clearCart, itemCount, items, refreshCart, removeItem, summary, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
