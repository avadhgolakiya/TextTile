import { create } from 'zustand';
import type { Product } from './types';
import { toast } from '@/lib/toast';

interface SelectionState {
  isSelectionMode: boolean;
  selectedIds: Set<string>;
  selectedProducts: Record<string, Product>;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleProduct: (product: Product) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  isSelectionMode: false,
  selectedIds: new Set(),
  selectedProducts: {},

  enterSelectionMode: () => set({ isSelectionMode: true }),

  exitSelectionMode: () => set({
    isSelectionMode: false,
    selectedIds: new Set(),
    selectedProducts: {},
  }),

  toggleProduct: (product) => set((state) => {
    const newIds = new Set(state.selectedIds);
    const newProducts = { ...state.selectedProducts };

    if (newIds.has(product.id)) {
      newIds.delete(product.id);
      delete newProducts[product.id];
    } else {
      newIds.add(product.id);
      newProducts[product.id] = product;
    }

    return {
      selectedIds: newIds,
      selectedProducts: newProducts,
    };
  }),

  clearSelection: () => set({
    selectedIds: new Set(),
    selectedProducts: {},
  }),
}));
