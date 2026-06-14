'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BannerSlider } from '@/components/BannerSlider';
import { CATEGORIES, FALLBACK_BANNER } from '@/lib/constants/sample-data';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { productApi, bannerApi } from '@/lib/api-client';
import { useTranslation } from '@/lib/language-store';

/** Port of lib/features/home/home_screen.dart */
export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<{ image_url: string; redirect_url?: string }[]>([{ image_url: FALLBACK_BANNER }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.fetchFeatured().then((res) => res.products).catch(() => []),
      bannerApi.fetchUrls().then((res) => res.banners.length ? res.banners : [{ image_url: FALLBACK_BANNER }]).catch(() => [{ image_url: FALLBACK_BANNER }])
    ]).then(([prodRes, bannerRes]) => {
      setProducts(prodRes);
      setBanners(bannerRes);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner label={t('loadingDrop')} />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pt-6 lg:space-y-10 lg:px-0 lg:pt-0">
      <DesktopTopBar
        title={t('todaysDrop')}
        subtitle="Swastik Fashion wholesale"
      />

      <header className="lg:hidden">
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          {t('todaysDrop')}
        </p>
        <h1 className="font-serif text-3xl font-semibold">Swastik Fashion</h1>
        <Link href="/search" className="mt-3 block text-sm text-maroon">
          {t('searchSarees')} →
        </Link>
      </header>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <BannerSlider banners={banners} />

        <section className="mt-8 lg:col-span-4 lg:mt-0">
          <h2 className="mb-3 font-serif text-xl font-semibold lg:mb-4 lg:text-2xl">
            {t('categories')}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/products?category=${encodeURIComponent(cat.label.toLowerCase())}`}
                className="shrink-0 rounded-full border border-divider bg-cream-deep px-4 py-2 text-sm transition hover:border-gold hover:bg-white lg:rounded-2xl lg:px-5 lg:py-3 lg:text-base"
              >
                {cat.icon} {cat.label}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between lg:mb-6">
          <h2 className="font-serif text-xl font-semibold lg:text-2xl">{t('featuredProducts')}</h2>
          <Link
            href="/collection"
            className="hidden text-sm font-semibold text-maroon transition hover:text-maroon-dark lg:inline"
          >
            {t('viewFullCollection')} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5 items-start">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('noFeaturedProducts')}</p>
        ) : null}
      </section>
    </div>
  );
}
