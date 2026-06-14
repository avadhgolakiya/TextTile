'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, orderApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart-store';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { AppUser } from '@/lib/types';
import { formatInr } from '@/lib/formatting/inr';
import { useTranslation } from '@/lib/language-store';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function ProfilePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
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

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddress.trim() || !user) return;
    
    setIsSavingAddress(true);
    try {
      const token = getToken();
      await authApi.updateAddress(token, newAddress);
      setUser({ ...user, address: newAddress.trim() });
      setIsAddressModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAddress(false);
    }
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

  const currentLangLabel = 
    language === 'en' ? 'English' : 
    language === 'hi' ? 'हिन्दी' : 
    language === 'gu' ? 'ગુજરાતી' : 'English';

  const menuItems = [
    { title: t('savedProducts'), subtitle: t('savedProductsSubtitle'), icon: '🔖', action: () => router.push('/profile/saved') },
    { 
      title: t('shippingAddress'), 
      subtitle: user.address ? (user.address.length > 30 ? user.address.substring(0, 30) + '...' : user.address) : t('shippingAddressSubtitle'), 
      icon: '📍',
      action: () => {
        setNewAddress(user.address || '');
        setIsAddressModalOpen(true);
      }
    },
    { title: t('paymentMethods'), subtitle: t('paymentMethodsSubtitle'), icon: '💳' },
    { 
      title: t('preferences'), 
      subtitle: `${t('preferencesSubtitle')} (${currentLangLabel})`, 
      icon: '⚙️', 
      action: () => setLangModalOpen(true) 
    },
    { title: t('helpSupport'), subtitle: t('helpSupportSubtitle'), icon: '❓' },
  ];

  return (
    <div className="min-h-screen bg-cream pb-24 lg:bg-transparent lg:pb-0">
      <DesktopTopBar title={t('navProfile')} subtitle={t('wholesaleBuyer')} />

      {/* Profile Header Hero */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 pt-10 pb-16 shadow-md rounded-b-[36px] lg:mt-0 lg:rounded-card lg:px-10 lg:pt-8 lg:pb-10">
        <p className="text-xs uppercase tracking-[2.5px] text-gold font-semibold">
          {t('wholesaleBuyer')}
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
          <div className="lg:hidden text-white">
            <ThemeToggle className="text-white hover:text-white" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 mt-8">
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-center">
            <div className="text-lg font-bold text-gold">{orderCount}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{t('profileOrders')}</div>
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-center">
            <div className="text-lg font-bold text-gold">12</div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{t('profileSaved')}</div>
          </div>
          <div className="flex-1 bg-white/10 border border-white/10 rounded-2xl py-3 px-4 text-center">
            <div className="text-lg font-bold text-gold">
              {totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : formatInr(totalSpent)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{t('profileSpent')}</div>
          </div>
        </div>
      </div>

      {/* Profile Menu options */}
      <div className="px-6 -mt-6 lg:mt-8 lg:px-0 lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="card border border-divider shadow-md divide-y divide-divider overflow-hidden lg:col-span-7">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.action}
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
            <h3 className="font-serif text-xl font-bold">{t('accountSummary')}</h3>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {t('accountSummaryDesc')}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-cream-deep px-4 py-3 text-center">
                <div className="text-lg font-bold text-maroon">{orderCount}</div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary">{t('profileOrders')}</div>
              </div>
              <div className="rounded-2xl bg-cream-deep px-4 py-3 text-center">
                <div className="text-lg font-bold text-maroon">12</div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary">{t('profileSaved')}</div>
              </div>
              <div className="rounded-2xl bg-cream-deep px-4 py-3 text-center">
                <div className="text-lg font-bold text-maroon">
                  {totalSpent >= 100000 ? `₹${(totalSpent / 100000).toFixed(1)}L` : formatInr(totalSpent)}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-text-secondary">{t('profileSpent')}</div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full h-14 bg-surface hover:bg-red-50 text-maroon hover:text-red-800 border border-divider hover:border-red-200 rounded-2xl font-semibold shadow-sm hover:shadow transition duration-200 mt-6 flex items-center justify-center gap-2 lg:mt-0 lg:cursor-pointer"
          >
            <span>🚪</span> {t('logout')}
          </button>

          <div className="text-center text-[10px] tracking-[2px] text-text-hint mt-8 uppercase font-medium lg:mt-0">
            ✦ Swastik Fashion · V1.0 ✦
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {langModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-surface rounded-[24px] border border-divider shadow-xl overflow-hidden p-6 space-y-6 animate-scaleIn">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-text-primary">
                {t('chooseLanguage')}
              </h3>
              <button
                onClick={() => setLangModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-deep hover:bg-divider transition text-text-secondary font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-2.5">
              {[
                { code: 'en', label: 'English', sub: 'English' },
                { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
                { code: 'gu', label: 'ગુજરાતી', sub: 'Gujarati' },
              ].map((langOpt) => {
                const active = language === langOpt.code;
                return (
                  <button
                    key={langOpt.code}
                    onClick={() => {
                      setLanguage(langOpt.code as any);
                      setLangModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition duration-200 ${
                      active
                        ? 'border-maroon bg-peach/50 text-maroon font-bold'
                        : 'border-divider bg-surface hover:bg-cream-deep text-text-primary'
                    }`}
                  >
                    <div className="text-left">
                      <div className="text-sm font-semibold">{langOpt.label}</div>
                      <div className="text-[10px] text-text-secondary mt-0.5">{langOpt.sub}</div>
                    </div>
                    {active && <span className="text-maroon font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-surface rounded-[24px] border border-divider shadow-xl overflow-hidden p-6 space-y-6 animate-scaleIn">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-text-primary">
                Shipping Address
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-deep hover:bg-divider transition text-text-secondary font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                  Delivery Address
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Enter your complete address..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSavingAddress || !newAddress.trim()}
                className="btn-primary w-full h-12"
              >
                {isSavingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
