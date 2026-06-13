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

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

/** Port of lib/features/cart/cart_screen.dart */
export default function CartPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const lines = useCartStore((s) => s.lines());
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const summary = orderSummary(lines);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    authApi
      .me(token)
      .then(({ user }) => {
        setBuyerName(user.businessName ?? user.email?.split('@')[0] ?? '');
        setBuyerPhone(user.phone ?? '');
      })
      .catch((err) => {
        console.error('Failed to auto-fetch profile in cart:', err);
      });
  }, []);

  async function placeOrder() {
    if (!lines.length || !buyerName.trim()) return;
    setSubmitting(true);

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

    openWhatsAppCart({
      lines,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim() || null,
    });

    clear();
    setSubmitting(false);
    router.push('/orders');
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

      <div className="lg:desktop-two-col">
        <ul className="space-y-4 lg:space-y-5">
          {lines.map((line) => (
            <li key={line.product.id} className="card flex gap-3 p-3 lg:gap-5 lg:p-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-deep lg:h-32 lg:w-28">
                {line.product.imageUrl ? (
                  <Image
                    src={line.product.imageUrl}
                    alt={line.product.name}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 lg:gap-3">
                <p className="font-semibold lg:text-lg">{line.product.name}</p>
                <p className="text-sm text-maroon lg:text-base">{formatInr(line.product.price)}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 transition hover:border-maroon hover:bg-cream-deep lg:cursor-pointer lg:px-4 lg:py-1.5"
                    onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="lg:text-base">{line.quantity}</span>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 transition hover:border-maroon hover:bg-cream-deep lg:cursor-pointer lg:px-4 lg:py-1.5"
                    onClick={() => setQuantity(line.product.id, line.quantity + 1)}
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
            className="btn-primary w-full"
            disabled={submitting}
            onClick={placeOrder}
          >
            {submitting ? t('placingOrder') : t('placeOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
