'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/home', label: 'Drop' },
  { href: '/collection', label: 'Collection' },
  { href: '/orders', label: 'Orders' },
  { href: '/profile', label: 'Profile' },
] as const;

type Props = { isAdmin?: boolean };

/** Port of lib/widgets/app_bottom_nav.dart */
export function AppBottomNav({ isAdmin = false }: Props) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...tabs, { href: '/admin', label: 'Admin' } as const]
    : tabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-divider bg-white/95 backdrop-blur">
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
