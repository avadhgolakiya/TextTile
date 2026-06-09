'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, authApi } from '@/lib/api-client';
import { useCartStore } from '@/lib/cart-store';
import { formatInr } from '@/lib/formatting/inr';
import { openWhatsAppSingleOrder } from '@/lib/whatsapp';
import { DesktopTopBar } from '@/components/DesktopTopBar';
import { toast } from '@/lib/toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { isValidImageUrl } from '@/lib/image';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const addToCart = useCartStore((s) => s.add);

  useEffect(() => {
    productApi
      .fetchById(id)
      .then(({ product }) => {
        setProduct(product);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  async function handleWhatsAppOrder() {
    if (!product) return;
    let buyerName = 'Buyer';
    const token = getToken();
    if (token) {
      try {
        const { user } = await authApi.me(token);
        buyerName = user.businessName || user.email.split('@')[0];
      } catch (err) {
        console.error(err);
      }
    }
    openWhatsAppSingleOrder({ product, quantity, buyerName, note });
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart!`);
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
        <h2 className="font-serif text-2xl font-semibold">Product not found</h2>
        <button onClick={() => router.back()} className="btn-primary mt-6">
          Go back
        </button>
      </div>
    );
  }

  const images = (product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : []
  ).filter(isValidImageUrl);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-cream pb-24 lg:bg-transparent lg:pb-0">
      <DesktopTopBar title={product.name} subtitle={`Code: ${product.id}`} />

      {/* Header — mobile only */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur sticky top-0 z-10 border-b border-divider lg:hidden">
        <button
          onClick={() => router.back()}
          className="text-text-primary hover:text-maroon transition p-1 font-semibold"
        >
          ← Back
        </button>
        <h1 className="font-serif text-xl font-semibold text-text-primary truncate">
          {product.name}
        </h1>
      </header>

      {/* Main product wrapper */}
      <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-none lg:px-0 lg:py-0 lg:gap-12 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] bg-white rounded-card overflow-hidden shadow-sm border border-divider">
            {images.length > 0 ? (
              <Image
                src={images[activeImageIdx]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-cream-deep flex items-center justify-center text-text-secondary">
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
                  className={`relative w-16 h-20 rounded-md overflow-hidden shrink-0 border-2 transition duration-200 ${
                    i === activeImageIdx ? 'border-maroon scale-95 shadow' : 'border-divider'
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
            <span className="text-xs uppercase tracking-wider text-text-secondary">
              Code: {product.id}
            </span>
            <h2 className="font-serif text-3xl font-bold text-text-primary leading-tight lg:text-4xl">
              {product.name}
            </h2>
            {product.subtitle && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.subtitle}
              </p>
            )}
          </div>

          {/* Prices */}
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
                    {discountPercent}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              Estimated for {quantity} pc: {formatInr(product.price * quantity)}
            </p>
          </div>

          <hr className="border-divider" />

          {/* Quantity Selector */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-text-primary">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 border border-divider rounded-full flex items-center justify-center text-lg hover:bg-cream-deep transition"
              >
                −
              </button>
              <span className="text-base font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(999, q + 1))}
                className="w-10 h-10 border border-divider rounded-full flex items-center justify-center text-lg hover:bg-cream-deep transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Note to shop */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-text-primary">Note to shop (optional)</span>
            <textarea
              className="w-full rounded-input border border-divider bg-white px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
              rows={3}
              placeholder="e.g. Need before Diwali, specific shade…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 pt-2">
            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full h-14 bg-gradient-to-r from-[#1B8C4D] to-[#25D366] text-white rounded-[18px] font-bold text-base shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.407 1.264 4.849L2 22l5.313-1.393c1.405.766 3.003 1.205 4.699 1.205 5.506 0 9.988-4.482 9.988-9.988 0-5.506-4.482-9.988-9.988-9.988zm6.541 14.248c-.287.808-1.42 1.484-1.966 1.55-.472.057-1.093.086-1.768-.13a10.05 10.05 0 0 1-4.053-2.482 9.878 9.878 0 0 1-2.482-4.053c-.314-.805-.282-1.39-.053-1.768.125-.205.287-.417.43-.585.161-.186.214-.287.319-.489.105-.205.053-.385-.027-.551-.08-.166-.719-1.734-.985-2.382-.258-.632-.524-.543-.719-.553-.186-.01-.4-.01-.611-.01-.212 0-.557.08-.849.4-.293.319-1.117 1.093-1.117 2.662 0 1.569 1.143 3.087 1.303 3.3.161.212 2.25 3.434 5.451 4.819.76.329 1.353.526 1.815.672.763.243 1.458.209 2.008.127.611-.09 1.868-.763 2.133-1.465.266-.702.266-1.303.186-1.43-.08-.127-.293-.205-.611-.365s-1.868-.921-2.155-1.026c-.287-.105-.497-.161-.708.161-.212.319-.82 1.026-1.006 1.237-.186.212-.373.238-.691.08-.319-.16-1.344-.495-2.56-1.58-1.002-.892-1.68-1.996-1.876-2.332-.196-.336-.021-.518.139-.677.144-.143.319-.373.48-.558.16-.186.214-.319.319-.53.106-.212.053-.399-.027-.558-.08-.16-.719-1.734-.985-2.382z" />
              </svg>
              Place order on WhatsApp
            </button>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full h-14 border-2 border-maroon text-maroon hover:bg-peach transition rounded-[18px] font-bold text-base"
            >
              Add to cart instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
