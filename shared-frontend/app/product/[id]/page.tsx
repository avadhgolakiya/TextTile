'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi } from '@/lib/api-client';
import { formatInr } from '@/lib/formatting/inr';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { useTranslation } from '@/lib/language-store';
import { getFullImageUrl } from '@/lib/image';
import { toast } from '@/lib/toast';

export default function SharedProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [setProducts, setSetProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsHovered(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const imageUrls = product?.imageUrls?.length ? product.imageUrls : (product?.imageUrl ? [product.imageUrl] : []);

    if (isLeftSwipe) {
      setActiveImageIdx((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
    } else if (isRightSwipe) {
      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1));
    }
  };

  useEffect(() => {
    if (!product || isHovered) return;
    
    const imageUrls = product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [];
        
    if (imageUrls.length > 1) {
      const interval = setInterval(() => {
        setActiveImageIdx((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [product, isHovered]);

  useEffect(() => {
    productApi
      .fetchById(id)
      .then(({ product }) => {
        setProduct(product);
        setLoading(false);

        // Fetch other products in the same saree set
        if (product.sareeSet) {
          productApi.fetchAll()
            .then(({ products }) => {
              const matched = products.filter(
                (p) => p.sareeSet === product.sareeSet && p.id !== product.id
              );
              setSetProducts(matched);
            })
            .catch(console.error);
        } else {
          setSetProducts([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  async function handleShare() {
    if (!product) return;
    const url = window.location.href;

    const canShareFiles = typeof navigator.canShare === 'function';

    if (navigator.share && canShareFiles && images.length > 0) {
      try {
        const filePromises = images.map(async (imgUrl, i) => {
          const res = await fetch(imgUrl);
          const blob = await res.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          return new File([blob], `${product.name.replace(/\s+/g, '_')}_${i + 1}.${ext}`, { type: blob.type });
        });
        const files = await Promise.all(filePromises);

        const shareData: ShareData = {
          title: product.name,
          text: `✨ *${product.name}*\nCode: ${product.id}${product.price ? `\nPrice: ${formatInr(product.price)}` : ''}\n\nCheck it out!`,
          files,
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (err) {
        console.error('File share failed, falling back:', err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}!`,
          url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  }

  async function handleDownload() {
    if (!product || images.length === 0) return;
    try {
      const activeImgUrl = images[activeImageIdx];
      const res = await fetch(activeImgUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = blob.type.includes('png') ? 'png' : 'jpg';
      link.download = `${product.name.replace(/\s+/g, '_')}_${activeImageIdx + 1}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download image');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingSpinner label="Loading details…" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
        <h2 className="font-serif text-2xl font-semibold">{t('productNotFound')}</h2>
        <button onClick={() => router.back()} className="btn-primary mt-6">
          {t('goBack')}
        </button>
      </div>
    );
  }

  const imagesSet = new Set<string>();
  if (product.imageUrl) imagesSet.add(product.imageUrl);
  if (product.imageUrls && product.imageUrls.length > 0) {
    product.imageUrls.forEach((img) => imagesSet.add(img));
  }
  const images = Array.from(imagesSet).map((img) => getFullImageUrl(img));

  const discountPercent = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cream pb-24 lg:bg-transparent lg:pb-0">
      <DesktopTopBar title={product.name} subtitle={`${t('codeLabel')}: ${product.id}`} />

      {/* Header — mobile only */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-divider lg:hidden">
        <button
          onClick={() => router.back()}
          className="text-text-primary hover:text-maroon transition p-1 font-semibold"
        >
          ← {t('goBack')}
        </button>
        <h1 className="font-serif text-xl font-semibold text-text-primary truncate">
          {product.name}
        </h1>
      </header>

      {/* Main product wrapper */}
      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-none lg:px-0 lg:py-0 lg:gap-12 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div 
            className="relative bg-surface rounded-card overflow-hidden shadow-sm border border-divider group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 0 ? (
              <div className="relative w-full aspect-[9/16] transition-transform duration-300">
                <img
                  src={images[activeImageIdx]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white text-text-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Previous image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white text-text-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Next image"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[9/16] bg-cream-deep flex items-center justify-center text-text-secondary">
                No Image Available
              </div>
            )}
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-gold to-[#D4AE55] text-white px-3 py-1 text-xs font-bold shadow-sm">
                {product.badge.toUpperCase()}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`relative w-16 h-20 rounded-md overflow-hidden shrink-0 border-2 transition duration-200 ${i === activeImageIdx ? 'border-maroon scale-95 shadow' : 'border-divider'
                    }`}
                >
                  <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Actions */}
        <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-text-secondary">
                {t('codeLabel')}: {product.id}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload} 
                  className="p-2 text-maroon hover:bg-peach rounded-full transition flex items-center justify-center" 
                  title="Download Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  onClick={handleShare} 
                  className="p-2 text-maroon hover:bg-peach rounded-full transition flex items-center justify-center" 
                  title="Share Product"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
            <h2 className="font-serif text-3xl font-bold text-text-primary leading-tight lg:text-4xl">
              {product.name}
            </h2>
            {product.subtitle && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.subtitle}
              </p>
            )}
            {product.stock !== undefined && product.stock > 0 && product.stock <= 10 && (
              <div className="mt-2 inline-block bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                🏃 Hurry! Only {product.stock} left in stock
              </div>
            )}
            {product.stock === 0 && (
              <div className="mt-2 inline-block bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                ❌ Out of Stock
              </div>
            )}
          </div>

          {/* Prices */}
          {product.price ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-maroon">
                  {formatInr(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-text-secondary line-through">
                      {formatInr(product.originalPrice)}
                    </span>
                    <span className="bg-peach border border-maroon/20 text-maroon text-xs px-2.5 py-1 rounded-full font-bold">
                      {discountPercent}% {t('discountOff')}
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {setProducts.length > 0 && (
            <div className="space-y-2 bg-cream-deep/30 p-3 rounded-2xl border border-divider/50">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                Other Colors in this Design:
              </span>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {setProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      router.push(`/product/${p.id}`);
                    }}
                    className="group flex flex-col items-center gap-1 shrink-0"
                    title={p.name}
                  >
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden border border-divider group-hover:border-maroon transition duration-200 shadow-sm group-hover:scale-105">
                      <Image
                        src={getFullImageUrl(p.imageUrl)}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
