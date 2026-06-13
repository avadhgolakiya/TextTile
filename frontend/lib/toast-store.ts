'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ConfirmState = {
  message: string;
  resolve: (value: boolean) => void;
} | null;

type ToastState = {
  toasts: Toast[];
  confirm: ConfirmState;
  push: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  resolveConfirm: (value: boolean) => void;
};

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  confirm: null,

  push: (message, type = 'info') => {
    const id = `toast-${++toastCounter}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => get().dismiss(id), 4000);
  },

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  showConfirm: (message) =>
    new Promise<boolean>((resolve) => {
      set({ confirm: { message, resolve } });
    }),

  resolveConfirm: (value) => {
    const { confirm } = get();
    confirm?.resolve(value);
    set({ confirm: null });
  },
}));
