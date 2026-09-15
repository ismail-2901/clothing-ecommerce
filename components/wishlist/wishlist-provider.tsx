"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { addWishlistItem, removeWishlistItem, toggleWishlistItem, type WishlistItem } from "@/features/wishlist/wishlist";

const STORAGE_KEY = "elaris-wishlist-v1";

type WishlistContextValue = {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, "addedAt">) => void;
  isSaved: (productId: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function readStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

/**
 * Syncs with /api/wishlist when the user is logged in.
 * Merges local localStorage items into the DB on first load,
 * then clears localStorage and uses DB as source of truth.
 */
export function WishlistProvider({ children, serverProductIds }: { children: ReactNode; serverProductIds?: string[] }) {
  const [items, setItems] = useState<WishlistItem[]>(readStoredWishlist);
  const [synced, setSynced] = useState(false);

  // On mount: if server passed productIds (user is logged in), merge local + server
  useEffect(() => {
    if (serverProductIds === undefined) {
      // Guest: keep localStorage only
      setSynced(true);
      return;
    }

    const localItems = readStoredWishlist();

    // Push any local items that aren't in the DB yet
    const newLocals = localItems.filter((l) => !serverProductIds.includes(l.productId));
    Promise.all(
      newLocals.map((l) =>
        fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: l.productId })
        }).catch(() => undefined)
      )
    ).finally(() => {
      // Merge: server items become stubs (name/price resolved on wishlist page via SSR)
      const serverStubs: WishlistItem[] = serverProductIds.map((id) => ({
        productId: id,
        slug: "",
        name: "",
        price: 0,
        image: "",
        addedAt: new Date().toISOString()
      }));
      const merged = [...serverStubs];
      for (const local of localItems) {
        if (!merged.some((m) => m.productId === local.productId)) {
          merged.push(local);
        }
      }
      setItems(merged);
      window.localStorage.removeItem(STORAGE_KEY); // DB is source of truth now
      setSynced(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage only for guests (no serverProductIds)
  useEffect(() => {
    if (!synced || serverProductIds !== undefined) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, synced, serverProductIds]);

  const addItem = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((current) => addWishlistItem(current, item));
    if (serverProductIds !== undefined) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: item.productId })
      }).catch(() => undefined);
    }
  }, [serverProductIds]);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => removeWishlistItem(current, productId));
    if (serverProductIds !== undefined) {
      fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      }).catch(() => undefined);
    }
  }, [serverProductIds]);

  const toggleItem = useCallback((item: Omit<WishlistItem, "addedAt">) => {
    setItems((current) => {
      const next = toggleWishlistItem(current, item);
      const wasAdded = next.some((i) => i.productId === item.productId);
      if (serverProductIds !== undefined) {
        fetch("/api/wishlist", {
          method: wasAdded ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId })
        }).catch(() => undefined);
      }
      return next;
    });
  }, [serverProductIds]);

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
