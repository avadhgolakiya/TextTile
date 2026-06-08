import { ProductCard } from '@/components/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CATEGORIES, FALLBACK_BANNER } from '@/lib/constants/sample-data';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Product } from '@/lib/types';
import { productApi, bannerApi } from '@/lib/api-client';

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
    <div className="space-y-8 px-4 pt-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          Today&apos;s Drop
        </p>
        <h1 className="font-serif text-3xl font-semibold">Swastik Fashion</h1>
        <Link href="/search" className="mt-3 block text-sm text-maroon">
          Search sarees →
        </Link>
      </header>

      <div className="relative aspect-[16/7] overflow-hidden rounded-card">
        <Image src={banners[0]} alt="Promo banner" fill className="object-cover" priority />
      </div>

      <section>
        <h2 className="mb-3 font-serif text-xl font-semibold">Categories</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/products?category=${encodeURIComponent(cat.label.toLowerCase())}`}
              className="shrink-0 rounded-full border border-divider bg-cream-deep px-4 py-2 text-sm"
            >
              {cat.icon} {cat.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-xl font-semibold">Featured</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
