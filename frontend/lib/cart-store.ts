'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, Product } from './types';

/** Port of lib/cart/cart_store.dart — persisted for web refresh parity */
type CartState = {
  byId: Record<string, CartLine>;
  _lines?: CartLine[];
  _totalQuantity?: number;
  lines: () => CartLine[];
  totalQuantity: () => number;
  add: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

function computeDerivedState(byId: Record<string, CartLine>) {
  const lines = Object.entries(byId)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, line]) => line);
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  return { _lines: lines, _totalQuantity: totalQuantity };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      byId: {},
      _lines: [],
      _totalQuantity: 0,

      lines: () => {
        const state = get();
        if (!state._lines || (state._lines.length === 0 && Object.keys(state.byId).length > 0)) {
          return computeDerivedState(state.byId)._lines;
        }
        return state._lines || [];
      },

      totalQuantity: () => {
        const state = get();
        if (state._totalQuantity === undefined && Object.keys(state.byId).length > 0) {
          return computeDerivedState(state.byId)._totalQuantity;
        }
        return state._totalQuantity || 0;
      },

      add: (product, quantity = 1) => {
        if (quantity <= 0) return;
        set((state) => {
          const existing = state.byId[product.id];
          const nextQty = (existing?.quantity ?? 0) + quantity;
          const nextById = {
            ...state.byId,
            [product.id]: { product, quantity: nextQty },
          };
          const derived = computeDerivedState(nextById);
          return {
            byId: nextById,
            ...derived,
          };
        });
      },

      setQuantity: (productId, quantity) => {
        set((state) => {
          const line = state.byId[productId];
          if (!line) return state;
          let nextById: Record<string, CartLine>;
          if (quantity <= 0) {
            const { [productId]: _, ...rest } = state.byId;
            nextById = rest;
          } else {
            nextById = {
              ...state.byId,
              [productId]: { product: line.product, quantity },
            };
          }
          const derived = computeDerivedState(nextById);
          return {
            byId: nextById,
            ...derived,
          };
        });
      },

      remove: (productId) => {
        set((state) => {
          const { [productId]: _, ...rest } = state.byId;
          const derived = computeDerivedState(rest);
          return {
            byId: rest,
            ...derived,
          };
        });
      },

      clear: () => set({ byId: {}, _lines: [], _totalQuantity: 0 }),
    }),
    { name: 'saarika-cart' },
  ),
);
