'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BannerSlider } from '@/components/BannerSlider';
import { FALLBACK_BANNER } from '@/lib/constants/sample-data';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { productApi, bannerApi } from '@/lib/api-client';
import { useTranslation } from '@/lib/language-store';
import { getFullImageUrl, isValidImageUrl } from '@/lib/image';

/** Port of lib/features/home/home_screen.dart */
export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<{ image_url: string; redirect_url?: string }[]>([{ image_url: FALLBACK_BANNER }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.fetchAll().then((res) => res.products).catch(() => []),
      bannerApi.fetchUrls().then((res) => res.banners.length ? res.banners : [{ image_url: FALLBACK_BANNER }]).catch(() => [{ image_url: FALLBACK_BANNER }])
    ]).then(([prodRes, bannerRes]) => {
      setProducts(prodRes);
      setBanners(bannerRes);
      setLoading(false);
    });
  }, []);

  const categoriesWithImages: { name: string; imageUrl: string }[] = [];
  const seenCategories = new Set<string>();

  products.forEach((p) => {
    const cat = p.categoryKey?.trim();
    if (cat && !seenCategories.has(cat.toLowerCase())) {
      seenCategories.add(cat.toLowerCase());
      categoriesWithImages.push({
        name: cat,
        imageUrl: p.imageUrl || FALLBACK_BANNER
      });
    }
  });

  const featuredProducts = products.filter(p => p.isFeatured);

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

      <BannerSlider banners={banners} />

      {/* Circle Categories Section */}
      {categoriesWithImages.length > 0 && (
        <section className="pt-2">
          <h2 className="mb-4 font-serif text-2xl font-semibold">Scroll. Pick. Shop.</h2>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {categoriesWithImages.map((cat) => (
              <Link
                key={cat.name}
                href={`/collection?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 shrink-0 group w-[72px] lg:w-24"
              >
                <div className="w-[72px] h-[72px] lg:w-24 lg:h-24 rounded-full overflow-hidden border border-divider group-hover:border-maroon transition duration-300 shadow-sm relative">
                  <Image
                    src={isValidImageUrl(cat.imageUrl) ? getFullImageUrl(cat.imageUrl) : FALLBACK_BANNER}
                    alt={cat.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-[11px] lg:text-xs font-semibold text-text-primary text-center capitalize line-clamp-2 leading-tight group-hover:text-maroon transition">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {featuredProducts.length === 0 ? (
          <p className="text-sm text-text-secondary">{t('noFeaturedProducts')}</p>
        ) : null}
      </section>
    </div>
  );
}
