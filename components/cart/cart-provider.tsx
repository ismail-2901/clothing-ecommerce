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

const STORAGE_KEY = "elaris-cart-v1";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  summary: PricingResult;
  addItem: (item: CartItemInput) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

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
      .filter((item) => item.sku && item.productId && item.name);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CartItemInput) => {
    setItems((current) => addCartItem(current, normalizeCartItem(item)));
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    setItems((current) => {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return current.filter((item) => item.sku !== sku);
      }

      return current.map((item) =>
        item.sku === sku ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((sku: string) => {
    setItems((current) => current.filter((item) => item.sku !== sku));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const summary = useMemo(
    () =>
      calculateCartSummary({
        items,
        shippingFee: items.length > 0 ? 8000 : 0
      }),
    [items]
  );

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
      clearCart
    }),
    [addItem, clearCart, itemCount, items, removeItem, summary, updateQuantity]
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
