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
  const [isServerBacked, setIsServerBacked] = useState(serverProductIds !== undefined);

  useEffect(() => {
    if (serverProductIds !== undefined) {
      setIsServerBacked(true);
      const localItems = readStoredWishlist();
      const newLocals = localItems.filter((l) => !serverProductIds.includes(l.productId));
      Promise.all(
        newLocals.map((l) =>
          fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: l.productId })
          }).catch((err) => console.error("[Wishlist] Initial sync failed:", err))
        )
      ).finally(() => {
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
        window.localStorage.removeItem(STORAGE_KEY);
        setSynced(true);
      });
      return;
    }

    // Client-side auto-discovery: fetch /api/wishlist on mount
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { items?: string[]; authenticated?: boolean } | null) => {
        if (!data || !data.authenticated) {
          setItems(readStoredWishlist());
          setIsServerBacked(false);
          setSynced(true);
          return;
        }

        setIsServerBacked(true);
        const remoteIds: string[] = data.items ?? [];
        const localItems = readStoredWishlist();
        const newLocals = localItems.filter((l) => !remoteIds.includes(l.productId));

        Promise.all(
          newLocals.map((l) =>
            fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId: l.productId })
            }).catch((err) => console.error("[Wishlist] Initial sync failed:", err))
          )
        ).finally(() => {
          const serverStubs: WishlistItem[] = remoteIds.map((id) => ({
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
          window.localStorage.removeItem(STORAGE_KEY);
          setSynced(true);
        });
      })
      .catch(() => {
        setItems(readStoredWishlist());
        setIsServerBacked(false);
        setSynced(true);
      });
  }, [serverProductIds]);

  // Persist to localStorage only for guests (not server-backed)
  useEffect(() => {
    if (!synced || isServerBacked) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, synced, isServerBacked]);

  const addItem = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      setItems((current) => addWishlistItem(current, item));
      if (isServerBacked) {
        fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: item.productId })
        }).catch((err) => console.error("[Wishlist] Add item failed:", err));
      }
    },
    [isServerBacked]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((current) => removeWishlistItem(current, productId));
      if (isServerBacked) {
        fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        }).catch((err) => console.error("[Wishlist] Remove item failed:", err));
      }
    },
    [isServerBacked]
  );

  const toggleItem = useCallback(
    (item: Omit<WishlistItem, "addedAt">) => {
      setItems((current) => {
        const next = toggleWishlistItem(current, item);
        const wasAdded = next.some((i) => i.productId === item.productId);
        if (isServerBacked) {
          fetch("/api/wishlist", {
            method: wasAdded ? "POST" : "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: item.productId })
          }).catch((err) => console.error("[Wishlist] Toggle item failed:", err));
        }
        return next;
      });
    },
    [isServerBacked]
  );

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
