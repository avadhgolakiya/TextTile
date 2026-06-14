'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/language-store';

type Props = { isAdmin?: boolean; isLoggedIn?: boolean };

/** Port of lib/widgets/app_bottom_nav.dart */
export function AppBottomNav({ isAdmin = false, isLoggedIn = false }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { href: '/home', label: t('navHome') },
    { href: '/collection', label: t('navCollection') },
  ];

  if (isLoggedIn) {
    tabs.push({ href: '/orders', label: t('navOrders') });
    tabs.push({ href: '/profile', label: t('navProfile') });
  } else {
    tabs.push({ href: '/login', label: t('signIn') });
  }

  const items = isAdmin
    ? [...tabs, { href: '/admin', label: t('navAdmin') }]
    : tabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-divider bg-white/95 backdrop-blur lg:hidden">
      <ul className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {items.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`block rounded-full px-4 py-2 text-xs font-semibold transition ${
                  active
                    ? 'bg-maroon text-white'
                    : 'text-text-secondary hover:text-maroon'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
