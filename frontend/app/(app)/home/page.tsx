import { ProductCard } from '@/components/ProductCard';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CATEGORIES, FALLBACK_BANNER } from '@/lib/constants/sample-data';
import { isValidImageUrl } from '@/lib/image';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Product } from '@/lib/types';
import { productApi, bannerApi } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

async function fetchFeatured(): Promise<Product[]> {
  try {
    const { products } = await productApi.fetchFeatured();
    return products;
  } catch (err) {
    console.error('Error fetching featured products:', err);
    return [];
  }
}

async function fetchBanners(): Promise<string[]> {
  try {
    const { urls } = await bannerApi.fetchUrls();
    return urls.length ? urls : [FALLBACK_BANNER];
  } catch (err) {
    console.error('Error fetching banners:', err);
    return [FALLBACK_BANNER];
  }
}

async function HomeContent() {
  const [products, banners] = await Promise.all([
    fetchFeatured(),
    fetchBanners(),
  ]);

  return (
    <div className="space-y-8 px-4 pt-6 lg:space-y-10 lg:px-0 lg:pt-0">
      <DesktopTopBar
        title="Today's Drop"
        subtitle="Swastik Fashion wholesale"
      />

      <header className="lg:hidden">
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          Today&apos;s Drop
        </p>
        <h1 className="font-serif text-3xl font-semibold">Swastik Fashion</h1>
        <Link href="/search" className="mt-3 block text-sm text-maroon">
          Search sarees →
        </Link>
      </header>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="relative aspect-[16/7] overflow-hidden rounded-card lg:col-span-8 lg:aspect-[21/9]">
          <Image
            src={isValidImageUrl(banners[0]) ? banners[0] : FALLBACK_BANNER}
            alt="Promo banner"
            fill
            className="object-cover"
            priority
          />
        </div>

        <section className="mt-8 lg:col-span-4 lg:mt-0">
          <h2 className="mb-3 font-serif text-xl font-semibold lg:mb-4 lg:text-2xl">
            Categories
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
          <h2 className="font-serif text-xl font-semibold lg:text-2xl">Featured</h2>
          <Link
            href="/collection"
            className="hidden text-sm font-semibold text-maroon transition hover:text-maroon-dark lg:inline"
          >
            View full collection →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-text-secondary">No featured products yet.</p>
        ) : null}
      </section>
    </div>
  );
}

/** Port of lib/features/home/home_screen.dart */
export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading today&apos;s drop…" />}>
      <HomeContent />
    </Suspense>
  );
}
