'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useTranslation } from '@/lib/language-store';

type Props = { isAdmin?: boolean; isLoggedIn?: boolean };

/** Desktop-only left sidebar navigation (hidden below lg). */
export function AppSidebar({ isAdmin = false, isLoggedIn = false }: Props) {
  const pathname = usePathname();
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const { t } = useTranslation();

  const navItems = [
    { href: '/home', label: t('todaysDrop'), icon: '✦' },
    { href: '/collection', label: t('navCollection'), icon: '🧵' },
    { href: '/search', label: t('navSearch'), icon: '🔍' },
  ];

  if (isLoggedIn) {
    navItems.push({ href: '/profile', label: t('navProfile'), icon: '👤' });
  } else {
    navItems.push({ href: '/login', label: t('signIn'), icon: '🔑' });
    navItems.push({ href: '/signup', label: t('createAccount'), icon: '✨' });
  }

  const items = isAdmin
    ? [...navItems, { href: '/admin', label: t('navAdmin'), icon: '🛡️' }]
    : navItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-divider bg-surface lg:flex">
      <div className="border-b border-divider px-6 py-7 flex flex-col gap-2">
        <img
          src="/logo.jpg"
          alt="Swastik Fashion"
          className="h-12 w-auto object-contain"
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
          {t('wholesaleBuyer')}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 ${
                    active
                      ? 'bg-maroon text-white shadow-sm'
                      : 'text-text-secondary hover:bg-cream-deep hover:text-maroon'
                  }`}
                >
                  <span className="text-base" aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-divider p-4">
        <Link
          href="/cart"
          className="flex items-center justify-between rounded-2xl bg-maroon px-4 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-maroon-dark"
        >
          <span className="flex items-center gap-2">
            <span aria-hidden>🛒</span>
            {t('viewCart')}
          </span>
          {totalQuantity > 0 ? (
            <span className="rounded-full bg-surface/20 px-2.5 py-0.5 text-xs">
              {totalQuantity}
            </span>
          ) : null}
        </Link>
      </div>
    </aside>
  );
}
