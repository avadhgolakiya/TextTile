'use client';

import { useEffect, useState } from 'react';
import { collectionApi } from '@/lib/api-client';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';
import { useTranslation } from '@/lib/language-store';

export default function SharedCollectionClient({ id }: { id: string }) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    collectionApi
      .fetchById(id)
      .then(({ products }) => {
        setProducts(products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Shared collection not found or has expired.');
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-cream pb-12 lg:bg-transparent lg:pb-0">
      <DesktopTopBar
        title="Shared Collection"
        subtitle={`${products.length} items`}
      />

      {/* Hero Header — mobile only */}
      <div className="bg-gradient-to-br from-maroon-dark via-maroon to-[#8B1A2A] text-white px-6 py-10 rounded-b-[32px] shadow-md lg:hidden">
        <h1 className="font-serif text-3xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gold">
          Shared Collection
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {products.length} carefully selected items
        </p>
      </div>

      <div className="px-6 lg:px-0 mt-6 lg:mt-0">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="hidden lg:block font-serif text-2xl font-bold text-text-primary">
            Shared Products
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner label="Loading collection…" />
          </div>
        ) : error ? (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-lg font-serif">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-text-secondary">
            <p className="text-lg font-serif">{t('noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 items-start">
            {products.map((p, idx) => (
              <ProductCard key={`${p.id}-${idx}`} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
