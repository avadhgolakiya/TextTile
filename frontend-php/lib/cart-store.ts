'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, Product } from './types';

/** Port of lib/cart/cart_store.dart — persisted for web refresh parity */
type CartState = {
  byId: Record<string, CartLine>;
  lines: () => CartLine[];
  totalQuantity: () => number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      byId: {},

      lines: () =>
        Object.entries(get().byId)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, line]) => line),

      totalQuantity: () =>
        get().lines().reduce((sum, line) => sum + line.quantity, 0),

      add: (product, quantity = 1) => {
        if (quantity <= 0) return;
        set((state) => {
          const existing = state.byId[product.id];
          const nextQty = (existing?.quantity ?? 0) + quantity;
          return {
            byId: {
              ...state.byId,
              [product.id]: { product, quantity: nextQty },
            },
          };
        });
      },

      setQuantity: (productId, quantity) => {
        set((state) => {
          const line = state.byId[productId];
          if (!line) return state;
          if (quantity <= 0) {
            const { [productId]: _, ...rest } = state.byId;
            return { byId: rest };
          }
          return {
            byId: {
              ...state.byId,
              [productId]: { product: line.product, quantity },
            },
          };
        });
      },

      remove: (productId) => {
        set((state) => {
          const { [productId]: _, ...rest } = state.byId;
          return { byId: rest };
        });
      },

      clear: () => set({ byId: {} }),
    }),
    { name: 'saarika-cart' },
  ),
);
