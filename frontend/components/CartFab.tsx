'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/cart-store';

export function CartFab() {
  const totalQuantity = useCartStore((s) => s.totalQuantity());

  return (
    <Link
      href="/cart"
      className="fixed right-4 top-4 z-30 flex h-11 min-w-11 items-center justify-center rounded-full bg-maroon px-3 text-white shadow-lg lg:hidden"
      aria-label="Open cart"
    >
      <span aria-hidden>🛒</span>
      {totalQuantity > 0 ? (
        <span className="ml-1 text-xs font-bold">{totalQuantity}</span>
      ) : null}
    </Link>
  );
}
