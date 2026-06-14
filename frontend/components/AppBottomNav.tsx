'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/language-store';

type Props = { isAdmin?: boolean; isLoggedIn?: boolean };

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-2.59 2.08-3.61 5.75-2.39 8.9.04.1.08.2.08.33 0 .22-.15.42-.35.5-.22.1-.46.04-.56-.16-.39-.77-.52-1.63-.39-2.48-.96 1.05-1.55 2.5-1.52 4.02.04 2.87 2.39 5.25 5.27 5.51 3.51.32 6.5-2.44 6.5-5.89 0-1.28-.4-2.5-1.1-3.48zM12 19.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
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
    { href: '/home', label: 'Drop', icon: HomeIcon },
    { href: '/collection', label: t('navCollection'), icon: CollectionIcon },
  ];

  if (isLoggedIn) {
    tabs.push({ href: '/profile', label: t('navProfile'), icon: ProfileIcon });
  } else {
    tabs.push({ href: '/login', label: t('signIn'), icon: LoginIcon });
  }

  const items = isAdmin
    ? [...tabs, { href: '/admin', label: t('navAdmin'), icon: AdminIcon }]
    : tabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-surface rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-safe">
      <ul className="flex items-center justify-around px-2 pt-3 pb-3">
        {items.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="flex-1 flex justify-center">
              <Link
                href={tab.href}
                aria-label={tab.label}
                title={tab.label}
                className="flex flex-col items-center gap-1.5 group w-full py-1"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                    active
                      ? 'bg-maroon/10 scale-105'
                      : 'bg-transparent group-hover:bg-cream'
                  }`}
                >
                  <Icon className={`w-6 h-6 transition-colors duration-300 ${
                    active ? 'text-maroon' : 'text-text-secondary'
                  }`} />
                </div>
                <span className={`text-[10px] font-bold transition-colors duration-300 ${
                  active ? 'text-maroon' : 'text-text-secondary'
                }`}>
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
