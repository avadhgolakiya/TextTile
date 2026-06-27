'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BannerSlider } from '@/components/BannerSlider';
import { FALLBACK_BANNER } from '@/lib/constants/sample-data';
import Link from 'next/link';
import Image from 'next/image';
import type { Product, Category } from '@/lib/types';
import { productApi, bannerApi, categoryApi } from '@/lib/api-client';
import { useTranslation } from '@/lib/language-store';
import { getFullImageUrl, isValidImageUrl } from '@/lib/image';
import { MultiShareBar } from '@/components/MultiShareBar';
import { useSelectionStore } from '@/lib/selection-store';
import { OrganizationJsonLd } from 'next-seo';

/** Port of lib/features/home/home_screen.dart */
export default function HomePage() {
  const { t } = useTranslation();
  const isSelectionMode = useSelectionStore((s) => s.isSelectionMode);
  const enterSelectionMode = useSelectionStore((s) => s.enterSelectionMode);
  const exitSelectionMode = useSelectionStore((s) => s.exitSelectionMode);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<{ image_url: string; redirect_url?: string }[]>([{ image_url: FALLBACK_BANNER }]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.fetchFeatured().then((res) => res.products).catch(() => []),
      bannerApi.fetchUrls().then((res) => res.banners.length ? res.banners : [{ image_url: FALLBACK_BANNER }]).catch(() => [{ image_url: FALLBACK_BANNER }]),
      categoryApi.fetchCategories().then((res) => res.categories || []).catch(() => [])
    ]).then(([prodRes, bannerRes, catRes]) => {
      setProducts(prodRes);
      setBanners(bannerRes);
      setCategories(catRes);
      setLoading(false);
    });
  }, []);

  const categoriesWithImages: { name: string; imageUrl: string }[] = [];

  if (categories.length > 0) {
    categories.forEach((cat) => {
      let imageUrl = '';
      if (isValidImageUrl(cat.icon)) {
        imageUrl = cat.icon;
      } else {
        const matchingProduct = products.find(
          (p) =>
            p.categoryKey?.toLowerCase() === cat.key.toLowerCase() ||
            p.categoryKey?.toLowerCase() === cat.name.toLowerCase()
        );
        imageUrl = matchingProduct?.imageUrl || FALLBACK_BANNER;
      }
      categoriesWithImages.push({
        name: cat.name,
        imageUrl: imageUrl,
      });
    });
  } else {
    // Old fallback behavior: group by products
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
  }

  const featuredProducts = products;

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner label={t('loadingDrop')} />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pt-6 lg:space-y-10 lg:px-0 lg:pt-0">
      {/* Search Engine Optimization H1 (Google compliance) */}
      <h1 className="sr-only">Swastik Fashion - Premium Clothing Store in India</h1>

      {/* Organization Structured Data (JSON-LD) via next-seo */}
      <OrganizationJsonLd
        type="Organization"
        name="Swastik Fashion"
        url="https://swastikfashion.com"
        logo="https://swastikfashion.com/logo.png"
        contactPoint={[
          {
            telephone: '+91-8849502490',
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi', 'Gujarati'],
          },
          {
            telephone: '+91-99228238292',
            contactType: 'sales support',
            areaServed: 'IN',
            availableLanguage: ['English', 'Hindi', 'Gujarati'],
          }
        ]}
      />

      <DesktopTopBar
        title={t('todaysDrop')}
        subtitle="Swastik Fashion wholesale"
      />

      <header className="lg:hidden">
        <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">
          {t('todaysDrop')}
        </p>
        <img
          src="/logo.jpg"
          alt="Swastik Fashion"
          className="h-10 w-auto object-contain"
        />
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
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between lg:mb-6 gap-2">
          <h2 className="font-serif text-xl font-semibold lg:text-2xl">{t('featuredProducts')}</h2>
          <div className="flex items-center gap-4">
            {!isSelectionMode ? (
              <button
                onClick={enterSelectionMode}
                className="bg-surface border border-divider px-3 py-1.5 rounded-lg text-xs font-bold text-text-primary shadow-sm hover:bg-cream-deep transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Select Multiple
              </button>
            ) : (
              <button
                onClick={exitSelectionMode}
                className="bg-cream-deep border border-divider px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary transition-colors"
              >
                Cancel Selection
              </button>
            )}
            <Link
              href="/collection"
              className="hidden text-sm font-semibold text-maroon transition hover:text-maroon-dark lg:inline"
            >
              {t('viewFullCollection')} →
            </Link>
          </div>
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

      {/* Brand Introduction Section (Natural Keyword Integration for SEO) */}
      <section className="border border-divider/60 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-4">
        <h2 className="font-serif text-xl font-semibold text-maroon dark:text-gold lg:text-2xl">
          Official Swastik Fashion Online Store
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed font-normal">
          Welcome to <strong className="text-text-primary">Swastik Fashion</strong>, your trusted online fashion destination for premium men&apos;s clothing, women&apos;s wear, kids fashion, ethnic wear, western outfits and affordable fashion accessories across India. We provide high-quality garments at competitive prices. As a leading manufacturer and wholesale publisher, we serve retail outlets and online shoppers looking for the latest designer clothing directly from Swastik Fashion India.
        </p>
      </section>

      <MultiShareBar />
    </div>
  );
}
