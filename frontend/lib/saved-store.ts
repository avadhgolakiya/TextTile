'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './types';

type SavedProductsState = {
  saved: Record<string, Product>;
  items: () => Product[];
  isSaved: (productId: string) => boolean;
  toggle: (product: Product) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useSavedStore = create<SavedProductsState>()(
  persist(
    (set, get) => ({
      saved: {},

      items: () => {
        return Object.values(get().saved);
      },

      isSaved: (productId) => {
        return !!get().saved[productId];
      },

      toggle: (product) => {
        set((state) => {
          const next = { ...state.saved };
          if (next[product.id]) {
            delete next[product.id];
          } else {
            next[product.id] = product;
          }
          return { saved: next };
        });
      },

      remove: (productId) => {
        set((state) => {
          const next = { ...state.saved };
          delete next[productId];
          return { saved: next };
        });
      },

      clear: () => set({ saved: {} }),
    }),
    { name: 'saarika-saved' },
  ),
);
