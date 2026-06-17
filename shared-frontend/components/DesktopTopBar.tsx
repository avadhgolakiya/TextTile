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
    'Shared Collection';

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
      </div>
    </header>
  );
}
