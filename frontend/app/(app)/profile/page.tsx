'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart-store';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { AppUser } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';

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
  const clearCart = useCartStore((s) => s.clear);

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
    <div className="min-h-screen bg-cream pb-24">
      {/* Profile Header Hero */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 pt-10 pb-16 shadow-md rounded-b-[36px]">
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
      <div className="px-6 -mt-6">
        <div className="card border border-divider shadow-md divide-y divide-divider overflow-hidden">
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

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full h-14 bg-white hover:bg-red-50 text-maroon hover:text-red-800 border border-divider hover:border-red-200 rounded-2xl font-semibold shadow-sm hover:shadow transition duration-200 mt-6 flex items-center justify-center gap-2"
        >
          <span>🚪</span> Logout
        </button>

        <div className="text-center text-[10px] tracking-[2px] text-text-hint mt-8 uppercase font-medium">
          ✦ Swastik Fashion · V1.0 ✦
        </div>
      </div>
    </div>
  );
}
