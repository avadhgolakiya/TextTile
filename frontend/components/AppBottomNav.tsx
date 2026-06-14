'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/language-store';

type Props = { isAdmin?: boolean; isLoggedIn?: boolean };

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CollectionIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function LoginIcon({ className }: { className?: string }) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );
}

/** Port of lib/widgets/app_bottom_nav.dart */
export function AppBottomNav({ isAdmin = false, isLoggedIn = false }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const tabs = [
    { href: '/home', label: t('navHome'), icon: HomeIcon },
    { href: '/collection', label: t('navCollection'), icon: CollectionIcon },
  ];

  if (isLoggedIn) {
    tabs.push({ href: '/orders', label: t('navOrders'), icon: OrdersIcon });
    tabs.push({ href: '/profile', label: t('navProfile'), icon: ProfileIcon });
  } else {
    tabs.push({ href: '/login', label: t('signIn'), icon: LoginIcon });
  }

  const items = isAdmin
    ? [...tabs, { href: '/admin', label: t('navAdmin'), icon: AdminIcon }]
    : tabs;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
      <ul className="flex items-center gap-1 sm:gap-2 rounded-[2rem] bg-black/85 backdrop-blur-md px-3 py-2 shadow-2xl border border-white/10">
        {items.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-label={tab.label}
                title={tab.label}
                className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-white/20 scale-105'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${
                  active ? 'text-white' : 'text-white/60'
                }`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
