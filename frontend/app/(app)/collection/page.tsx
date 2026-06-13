'use client';

import { useEffect, useState } from 'react';
import { productApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';
import { useTranslation } from '@/lib/language-store';

const filters = ['All', 'Sarees', 'Suits', 'Lehenga', 'Fabric', 'Dupatta'];

export default function CollectionPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('All');

  useEffect(() => {
    productApi
      .fetchAll()
      .then(({ products }) => {
        setProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selected === 'All') return true;
    return (
      p.name.toLowerCase().includes(selected.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(selected.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-cream pb-12 lg:bg-transparent lg:pb-0">
      <DesktopTopBar
        title={t('navCollection')}
        subtitle={`${products.length} ${t('itemsCount')}`}
      />

      {/* Hero Header — mobile only */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 py-10 rounded-b-[32px] shadow-md lg:hidden">
        <p className="text-xs uppercase tracking-[2.5px] text-gold font-semibold">
          Swastik Fashion
        </p>
        <h1 className="font-serif text-4xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gold">
          {t('navCollection')}
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {products.length} {t('itemsCount')}
        </p>
      </div>

      <div className="lg:desktop-split">
        {/* Filter chips — horizontal on mobile, vertical sidebar on desktop */}
        <aside className="px-6 py-4 lg:sticky lg:top-8 lg:px-0 lg:py-0">
          <h3 className="mb-3 hidden font-serif text-lg font-bold text-text-primary lg:block">
            {t('filterByType')}
          </h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-none lg:flex-col lg:overflow-visible lg:gap-2">
            {filters.map((f) => {
              const active = f === selected;
              return (
                <button
                  key={f}
                  onClick={() => setSelected(f)}
                  className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold border transition duration-200 lg:w-full lg:rounded-2xl lg:px-4 lg:py-3 lg:text-left ${
                    active
                      ? 'bg-gradient-to-r from-maroon-dark to-maroon text-white border-transparent shadow-sm'
                      : 'bg-white text-text-secondary border-divider hover:bg-cream-deep lg:hover:border-gold'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Grid of products */}
        <div className="px-6 lg:px-0">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Loading collection…" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-text-secondary">
              <p className="text-lg font-serif">{t('noProducts')}</p>
              <p className="text-sm mt-1">{t('tryAnotherCategory')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
