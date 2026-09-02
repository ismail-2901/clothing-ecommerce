"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addWishlistItem, removeWishlistItem, toggleWishlistItem, type WishlistItem } from "@/features/wishlist/wishlist";

const STORAGE_KEY = "atelier-wishlist-v1";

type WishlistContextValue = {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  isSaved: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(readStoredWishlist);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((current) => addWishlistItem(current, item));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => removeWishlistItem(current, productId));
  }, []);

  const toggleItem = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((current) => toggleWishlistItem(current, item));
  }, []);

  const isSaved = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({ items, addItem, removeItem, toggleItem, isSaved }),
    [addItem, isSaved, items, removeItem, toggleItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
