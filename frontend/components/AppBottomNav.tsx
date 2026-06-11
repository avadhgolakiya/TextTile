'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Icon Components with micro-animations
const FlameIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`h-5 w-5 transition-all duration-300 ${
      active
        ? 'scale-110 -translate-y-0.5 text-gold filter drop-shadow-[0_2px_6px_rgba(191,155,69,0.4)]'
        : 'text-text-secondary group-hover:scale-105 group-hover:text-maroon'
    }`}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const CollectionIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`h-5 w-5 transition-all duration-300 ${
      active
        ? 'scale-110 -translate-y-0.5 text-gold filter drop-shadow-[0_2px_6px_rgba(191,155,69,0.4)]'
        : 'text-text-secondary group-hover:scale-105 group-hover:text-maroon'
    }`}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const BagIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`h-5 w-5 transition-all duration-300 ${
      active
        ? 'scale-110 -translate-y-0.5 text-gold filter drop-shadow-[0_2px_6px_rgba(191,155,69,0.4)]'
        : 'text-text-secondary group-hover:scale-105 group-hover:text-maroon'
    }`}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`h-5 w-5 transition-all duration-300 ${
      active
        ? 'scale-110 -translate-y-0.5 text-gold filter drop-shadow-[0_2px_6px_rgba(191,155,69,0.4)]'
        : 'text-text-secondary group-hover:scale-105 group-hover:text-maroon'
    }`}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AdminIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`h-5 w-5 transition-all duration-300 ${
      active
        ? 'scale-110 -translate-y-0.5 rotate-45 text-gold filter drop-shadow-[0_2px_6px_rgba(191,155,69,0.4)]'
        : 'text-text-secondary group-hover:scale-105 group-hover:text-maroon'
    }`}
    viewBox="0 0 24 24"
    fill={active ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const tabs = [
  { href: '/home', label: 'Drop', Icon: FlameIcon },
  { href: '/collection', label: 'Collection', Icon: CollectionIcon },
  { href: '/orders', label: 'Orders', Icon: BagIcon },
  { href: '/profile', label: 'Profile', Icon: ProfileIcon },
] as const;

type Props = { isAdmin?: boolean };

export function AppBottomNav({ isAdmin = false }: Props) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = isAdmin
    ? [...tabs, { href: '/admin', label: 'Admin', Icon: AdminIcon } as const]
    : tabs;

  const rawActiveIndex = items.findIndex(
    (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`)
  );
  const activeIndex = rawActiveIndex === -1 ? 0 : rawActiveIndex;

  const tabWidthPercent = 100 / items.length;

  return (
    <nav className="fixed bottom-5 left-4 right-4 z-40 mx-auto max-w-md rounded-[22px] border border-white/20 bg-white/85 p-1.5 shadow-[0_12px_36px_rgba(78,10,21,0.12)] backdrop-blur-xl transition-all duration-300 lg:hidden">
      <div className="relative flex w-full items-center justify-between">
        {/* Animated Sliding Background Bubble nested with a 4px (top/bottom) and 4px (left/right) inset gap */}
        {mounted && (
          <div
            className="absolute bottom-1 top-1 rounded-[16px] bg-gradient-to-r from-maroon to-maroon-dark shadow-[0_4px_12px_rgba(123,20,40,0.35)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{
              width: `calc(${tabWidthPercent}% - 8px)`,
              left: `calc(${activeIndex * tabWidthPercent}% + 4px)`,
            }}
          />
        )}

        {/* Tab Buttons */}
        {items.map((tab, idx) => {
          const active = activeIndex === idx;
          const { Icon } = tab;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="group relative flex flex-1 flex-col items-center justify-center py-2.5 transition-all duration-300"
            >
              {/* Icon Container centered properly */}
              <div className="flex h-5 items-center justify-center">
                <Icon active={active} />
              </div>

              {/* Text Label aligned with proper spacing */}
              <span
                className={`mt-1 font-sans text-[10px] font-bold tracking-wide transition-all duration-300 ${
                  active
                    ? 'text-white scale-100 opacity-100'
                    : 'text-text-secondary scale-95 opacity-80 group-hover:text-maroon'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
