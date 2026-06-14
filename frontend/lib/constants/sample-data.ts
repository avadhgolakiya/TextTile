import type { CartLine, OrderSummary } from '../types';
import { cartLineTotal } from '../types';

/** Port of lib/data/sample_data.dart orderSummary */
export function orderSummary(lines: CartLine[]): OrderSummary {
  const subtotal = lines.reduce((sum, line) => sum + cartLineTotal(line), 0);
  const discountPercent = 10;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingAmount = 0;

  return {
    subtotal,
    discountPercent,
    shippingLabel: 'Free',
    shippingAmount,
    discountAmount,
    total: subtotal - discountAmount + shippingAmount,
  };
}

export const CATEGORIES = [
  { label: 'Sarees', icon: '🥻' },
  { label: 'Suits', icon: '👗' },
  { label: 'Lehenga', icon: '✨' },
] as const;

export const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=900&q=80';
