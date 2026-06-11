'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart-store';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { AppUser } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import { toast } from '@/lib/toast';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const clearCart = useCartStore((s) => s.clear);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  async function requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Notifications not supported in this browser.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        const { setupPushNotifications } = await import('@/lib/firebase-messaging');
        const { notificationApi } = await import('@/lib/api-client');
        const fcmToken = await setupPushNotifications(async (t) => {
          await notificationApi.registerToken(t);
        });
        if (fcmToken) {
          toast.success('Notifications enabled successfully!');
        } else {
          toast.success('Notifications enabled, token generated.');
        }
      } else if (permission === 'denied') {
        toast.error('Notification permission denied. Please enable them in browser settings.');
      }
    } catch (err) {
      toast.error(`Failed to enable notifications: ${err}`);
    }
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    
    Promise.all([
      authApi.me(token),
      orderApi.fetchMine(token)
    ])
      .then(([userRes, ordersRes]) => {
        setUser(userRes.user);
        setOrderCount(ordersRes.orders.length);
        const spent = ordersRes.orders.reduce((sum, o) => sum + o.total, 0);
        setTotalSpent(spent);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    clearCart();
    // Delete token cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.replace('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner label="Loading profile…" />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.businessName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-cream pb-24 lg:bg-transparent lg:pb-0">
      <DesktopTopBar title="Profile" subtitle="Wholesale buyer account" />

      {/* Profile Header Hero */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 pt-10 pb-16 shadow-md rounded-b-[36px] lg:mt-0 lg:rounded-card lg:px-10 lg:pt-8 lg:pb-10">
        <p className="text-xs uppercase tracking-[2.5px] text-gold font-semibold">
          Wholesale Buyer
        </p>

        <div className="flex items-center gap-4 mt-6">
          {/* Avatar Circle */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AE55] via-gold to-gold-muted border-2 border-gold/60 flex items-center justify-center font-serif text-2xl font-bold text-white shadow-md">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-2xl font-bold truncate">
              {user.businessName}
            </h2>
            <p className="text-sm text-white/70 mt-1 truncate">
              {user.phone ? `📞 ${user.phone}` : `✉️ ${user.email}`}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mt-8">
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-center">
            <div className="text-lg font-bold text-gold">{orderCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">Orders</div>
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-center">
            <div className="text-lg font-bold text-gold">12</div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">Saved</div>
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-center">
            <div className="text-lg font-bold text-gold">
              {totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : formatInr(totalSpent)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">Spent</div>
          </div>
        </div>
      </div>

      {/* Profile Menu options */}
      <div className="px-6 -mt-6 lg:mt-8 lg:px-0 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="card border border-divider shadow-md divide-y divide-divider overflow-hidden lg:col-span-7">
          {[
            { title: 'Saved Products', subtitle: '12 items', icon: '🔖' },
            { title: 'Shipping Address', subtitle: 'Surat, Gujarat', icon: '📍' },
            { title: 'Payment Methods', subtitle: 'UPI • Bank', icon: '💳' },
            { title: 'Preferences', subtitle: 'Notifications, language', icon: '⚙️' },
            { title: 'Help & Support', subtitle: 'WhatsApp, FAQ', icon: '❓' },
          ].map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-cream-deep transition duration-150"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary text-sm">{item.title}</h4>
                <p className="text-xs text-text-secondary mt-0.5">{item.subtitle}</p>
              </div>
              <span className="text-text-secondary text-sm">→</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-5 lg:space-y-6">
          <div className="card hidden border border-divider p-6 lg:block">
            <h3 className="font-serif text-xl font-bold">Account summary</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Manage your wholesale profile, saved items, and order history from one place.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-cream-deep px-4 py-3 text-center">
                <div className="text-lg font-bold text-maroon">{orderCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary">Orders</div>
              </div>
              <div className="rounded-2xl bg-cream-deep px-4 py-3 text-center">
                <div className="text-lg font-bold text-maroon">12</div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary">Saved</div>
              </div>
              <div className="rounded-2xl bg-cream-deep px-4 py-3 text-center">
                <div className="text-lg font-bold text-maroon">
                  {totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : formatInr(totalSpent)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary">Spent</div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="card border border-divider p-6 mt-6 lg:mt-0 space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <span>🔔</span> Push Notifications
              </h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                Get instant updates when new sarees are added to the wholesale catalog.
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-divider pt-3.5">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                Status: 
                {notificationPermission === 'granted' ? (
                  <span className="text-green-800 bg-green-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Enabled</span>
                ) : notificationPermission === 'denied' ? (
                  <span className="text-red-800 bg-red-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Blocked</span>
                ) : (
                  <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold">Not Enabled</span>
                )}
              </span>
              {notificationPermission === 'granted' ? (
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('show-pwa-notification-guide'))}
                  className="text-xs font-bold text-maroon hover:text-maroon-dark transition underline decoration-gold/50 hover:decoration-maroon"
                >
                  🔒 Lock Screen Guide
                </button>
              ) : (
                <button
                  onClick={requestNotificationPermission}
                  className="btn-primary py-2 px-5 text-xs font-bold shadow-sm"
                >
                  Enable
                </button>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full h-14 bg-white hover:bg-red-50 text-maroon hover:text-red-800 border border-divider hover:border-red-200 rounded-2xl font-semibold shadow-sm hover:shadow transition duration-200 mt-6 flex items-center justify-center gap-2 lg:mt-0 lg:cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>

          <div className="text-center text-[10px] tracking-[2px] text-text-hint mt-8 uppercase font-medium lg:mt-0">
            ✦ Swastik Fashion · V1.0 ✦
          </div>
        </div>
      </div>
    </div>
  );
}
