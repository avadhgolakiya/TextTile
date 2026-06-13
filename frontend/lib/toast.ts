'use client';

import { useToastStore } from './toast-store';

export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
  info: (message: string) => useToastStore.getState().push(message, 'info'),
  confirm: (message: string) => useToastStore.getState().showConfirm(message),
};
