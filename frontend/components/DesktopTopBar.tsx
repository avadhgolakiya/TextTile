'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useTranslation } from '@/lib/language-store';
import { ThemeToggle } from '@/components/ThemeToggle';

type Props = {
  title?: string;
  subtitle?: string;
};

/** Desktop-only top bar for page context + quick actions. */
export function DesktopTopBar({ title, subtitle }: Props) {
  const pathname = usePathname();
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const { t } = useTranslation();

  const titles: Record<string, string> = {
    '/home': t('todaysDrop'),
    '/collection': t('navCollection'),
    '/search': t('navSearch'),
    '/orders': t('navOrders'),
    '/profile': t('navProfile'),
    '/cart': t('navCart'),
    '/admin': t('navAdmin'),
  };

  const resolvedTitle =
    title ??
    Object.entries(titles).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] ??
    'Swastik Fashion';

  return (
    <header className="mb-8 hidden items-center justify-between border-b border-divider pb-6 lg:flex">
      <div>
        {subtitle ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
            {subtitle}
          </p>
        ) : null}
        <h2 className="font-serif text-3xl font-bold text-text-primary">
          {resolvedTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/search"
          className="rounded-full border border-divider bg-surface px-5 py-2.5 text-sm font-medium text-text-secondary transition hover:border-gold hover:text-maroon"
        >
          {t('navSearch')}
        </Link>
        <Link
          href="/cart"
          className="relative rounded-full bg-maroon px-5 py-2.5 text-sm font-bold text-white transition hover:bg-maroon-dark"
        >
          {t('navCart')}
          {totalQuantity > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-text-primary">
              {totalQuantity}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  );
}
