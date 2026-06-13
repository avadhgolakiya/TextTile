'use client';

import { useEffect, useState } from 'react';
import { orderApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { OrderItem } from '@/lib/types';
import Image from 'next/image';
import { formatInr } from '@/lib/formatting/inr';
import { useTranslation } from '@/lib/language-store';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    orderApi
      .fetchMine(token)
      .then(({ orders }) => {
        setOrders(orders);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'pending') return o.status === 'pending';
    return true;
  });

  function getStatusStyle(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-24 lg:bg-transparent lg:pb-0">
      <DesktopTopBar title={t('navOrders')} subtitle={t('wholesaleBuyer')} />

      {/* Header — mobile only */}
      <div className="px-6 pt-6 pb-2 lg:hidden">
        <p className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
          {t('wholesaleBuyer')}
        </p>
        <h1 className="font-serif text-3xl font-bold text-text-primary mt-1">
          {t('navOrders')}
        </h1>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-6 py-3 lg:px-0 lg:pb-6">
        {(['all', 'pending'] as const).map((mode) => {
          const active = filter === mode;
          return (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition duration-200 border border-transparent ${
                active
                  ? 'bg-maroon text-white shadow-sm'
                  : 'bg-peach text-text-primary hover:bg-cream-deep'
              }`}
            >
              {mode === 'all' ? t('allOrders') : t('pendingOrders')}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      <div className="px-6 py-4 space-y-4 lg:px-0 lg:py-0">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label={t('loadingOrders')} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-cream-deep flex items-center justify-center mx-auto text-text-secondary">
              📄
            </div>
            <h2 className="font-serif text-xl font-bold text-text-primary">
              {filter === 'pending' ? t('noPendingOrders') : t('noOrdersYet')}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('ordersEmptyDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-xl lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 xl:grid-cols-2">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="card flex gap-4 p-4 border border-divider shadow-sm hover:shadow-md transition lg:p-5 lg:hover:-translate-y-0.5"
              >
                <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-cream-deep border border-divider">
                  {order.thumbnailUrl ? (
                    <Image
                      src={order.thumbnailUrl}
                      alt={order.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-text-primary line-clamp-1">
                        {order.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {order.dateLabel} · {order.itemCountLabel}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${getStatusStyle(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="text-base font-bold text-maroon mt-2">
                    {formatInr(order.total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
