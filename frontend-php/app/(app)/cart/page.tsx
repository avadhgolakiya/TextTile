'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { useCartStore } from '@/lib/cart-store';
import { orderSummary } from '@/lib/constants/sample-data';
import { formatInr } from '@/lib/formatting/inr';
import { openWhatsAppCart } from '@/lib/whatsapp';
import { authApi, orderApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/language-store';
import { getFullImageUrl } from '@/lib/image';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

/** Port of lib/features/cart/cart_screen.dart */
export default function CartPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const byId = useCartStore((s) => s.byId);
  const lines = Object.entries(byId)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, line]) => line);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const summary = orderSummary(lines);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = getToken();
    if (!token) return;
    authApi
      .me(token)
      .then(({ user }) => {
        setBuyerName(user.businessName ?? user.email?.split('@')[0] ?? '');
        setBuyerPhone(user.phone ?? '');
        setBuyerAddress(user.address ?? '');
      })
      .catch((err) => {
        console.error('Failed to auto-fetch profile in cart:', err);
      });
  }, []);

  async function placeOrder() {
    if (!lines.length || !buyerName.trim()) return;

    if (!buyerAddress.trim()) {
      setIsAddressModalOpen(true);
      return;
    }

    setSubmitting(true);
    setIsOrdering(true);

    try {
      const token = getToken();
      if (token) {
        const orderLines = lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        }));
        await orderApi.create(token, {
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim() || undefined,
          lines: orderLines,
          total: summary.total,
        });
      }
    } catch (err) {
      console.error('Failed to save order to database:', err);
    }

    await openWhatsAppCart({
      lines,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim() || null,
      buyerAddress: buyerAddress.trim() || null,
    });

    clear();
    setSubmitting(false);
    setIsOrdering(false);
    router.push('/orders');
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!buyerAddress.trim()) return;
    
    setIsSavingAddress(true);
    try {
      const token = getToken();
      await authApi.updateAddress(token, buyerAddress);
      setIsAddressModalOpen(false);
      // Automatically place order after saving address
      placeOrder();
    } catch (err) {
      console.error(err);
      setIsSavingAddress(false);
    }
  }

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (!lines.length) {
    return (
      <div className="px-4 py-16 text-center lg:px-0">
        <DesktopTopBar title={t('navCart')} />
        <h1 className="font-serif text-2xl font-semibold lg:text-3xl">{t('cartEmpty')}</h1>
        <Link href="/home" className="btn-primary mt-6 inline-flex">
          {t('startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 lg:space-y-0 lg:px-0 lg:py-0">
      <DesktopTopBar title={t('navCart')} subtitle={`${lines.length} ${t('itemsCount')}`} />

      <h1 className="font-serif text-2xl font-semibold lg:hidden">{t('navCart')}</h1>

      <div className="desktop-two-col">
        <ul className="space-y-4 lg:space-y-5">
          {lines.map((line) => (
            <li key={line.product.id} className="card flex gap-3 p-3 lg:gap-5 lg:p-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-deep lg:h-32 lg:w-28">
                {line.product.imageUrl ? (
                  <Image
                    src={getFullImageUrl(line.product.imageUrl)}
                    alt={line.product.name}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 lg:gap-3">
                <p className="font-semibold lg:text-lg">{line.product.name}</p>
                <p className="text-sm text-maroon lg:text-base">{line.product.price ? formatInr(line.product.price) : 'Price on Request'}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 transition hover:border-maroon hover:bg-cream-deep lg:cursor-pointer lg:px-4 lg:py-1.5"
                    onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="lg:text-base text-center min-w-[20px]">
                    {line.quantity} <span className="text-xs text-text-secondary ml-1 font-medium">{line.product.sareeSet ? 'Set(s)' : 'pc'}</span>
                  </span>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 transition hover:border-maroon hover:bg-cream-deep lg:cursor-pointer lg:px-4 lg:py-1.5"
                    onClick={() => {
                      const maxQty = line.product.stock && line.product.stock > 0 ? line.product.stock : 999;
                      setQuantity(line.product.id, Math.min(maxQty, line.quantity + 1));
                    }}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="ml-auto text-xs text-text-secondary transition hover:text-maroon lg:cursor-pointer lg:text-sm"
                    onClick={() => remove(line.product.id)}
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-4 lg:sticky lg:top-8">
          <div className="card space-y-2 p-4 text-sm lg:p-6 lg:text-base">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>{formatInr(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-green-800">
              <span>{summary.discountPercent}% {t('wholesaleDiscount')}</span>
              <span>−{formatInr(summary.discountAmount)}</span>
            </div>
            <div className="flex justify-between font-bold lg:text-lg">
              <span>{t('grandTotal')}</span>
              <span>{formatInr(summary.total)}</span>
            </div>
          </div>

          <div className="card space-y-4 p-4 lg:p-6">
            <h3 className="font-serif text-lg font-semibold lg:text-xl">{t('buyerDetails')}</h3>
            <input
              className="input-field"
              placeholder={t('businessNamePlaceholder')}
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              required
            />
            <input
              className="input-field"
              placeholder={t('phonePlaceholder')}
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={submitting || isOrdering}
            onClick={placeOrder}
          >
            {isOrdering ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Preparing photos…
              </>
            ) : submitting ? t('placingOrder') : t('placeOrder')}
          </button>
        </div>
      </div>

      {/* Address Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-surface rounded-[24px] border border-divider shadow-xl overflow-hidden p-6 space-y-6 animate-scaleIn">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-text-primary">
                Add Shipping Address
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-deep hover:bg-divider transition text-text-secondary font-bold"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-text-secondary">
              Please provide a shipping address before completing your order via WhatsApp.
            </p>
            
            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                  Delivery Address
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Enter your complete address..."
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSavingAddress || !buyerAddress.trim()}
                className="btn-primary w-full h-12"
              >
                {isSavingAddress ? 'Saving...' : 'Save Address & Proceed'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
