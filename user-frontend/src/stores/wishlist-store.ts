"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoProduct } from "@/data/demo-catalog";

type WishlistState = {
  items: DemoProduct[];
  toggleItem: (product: DemoProduct) => void;
  addItem: (product: DemoProduct) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        set((state) => {
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }
          return { items: [...state.items, product] };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      toggleItem: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },
      hasItem: (productId) => get().items.some((item) => item.id === productId),
      clear: () => set({ items: [] }),
    }),
    { name: "v2005-wishlist" }
  )
);
