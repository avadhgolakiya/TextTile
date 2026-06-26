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
import { useTranslation } from '@/lib/language-store';
import { getFullImageUrl } from '@/lib/image';

function getToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find((row) => row.startsWith('token='))?.split('=')[1] ?? '';
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [setProducts, setSetProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [buyerName, setBuyerName] = useState('Buyer');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const addToCart = useCartStore((s) => s.add);
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

    const token = getToken();
    if (token) {
      authApi.me(token).then(({ user }) => {
        setBuyerName(user.businessName || user.email.split('@')[0] || 'Buyer');
        setBuyerPhone(user.phone || '');
        setBuyerAddress(user.address || '');
      }).catch(console.error);
    }
  }, [id]);

  async function handleWhatsAppOrder() {
    if (!product || isOrdering) return;

    const token = getToken();
    if (!token) {
      router.push(`/login?next=/products/${product.id}`);
      return;
    }

    if (!buyerAddress.trim()) {
      setIsAddressModalOpen(true);
      return;
    }

    setIsOrdering(true);
    try {
      await openWhatsAppSingleOrder({
        product,
        quantity,
        buyerName,
        buyerPhone: buyerPhone || null,
        buyerAddress: buyerAddress || null,
        note,
        imageUrls: images,
      });
    } finally {
      setIsOrdering(false);
    }
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!buyerAddress.trim()) return;

    setIsSavingAddress(true);
    try {
      const token = getToken();
      await authApi.updateAddress(token, buyerAddress);
      setIsAddressModalOpen(false);
      handleWhatsAppOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAddress(false);
    }
  }

  function handleAddToCart() {
    if (!product) return;

    const token = getToken();
    if (!token) {
      router.push(`/login?next=/products/${product.id}`);
      return;
    }

    addToCart(product, quantity);
    toast.success(`Added ${quantity} × ${product.name} to cart!`);
  }

  async function handleShare() {
    if (!product) return;
    const url = window.location.href;

    // Try to share actual image files via Web Share API (works on mobile Chrome/Safari)
    const canShareFiles = typeof navigator.canShare === 'function';

    if (navigator.share && canShareFiles && images.length > 0) {
      try {
        // Fetch all images as blobs
        const filePromises = images.map(async (imgUrl, i) => {
          const res = await fetch(imgUrl);
          const blob = await res.blob();
          const ext = blob.type.includes('png') ? 'png' : 'jpg';
          return new File([blob], `${product.name.replace(/\s+/g, '_')}_${i + 1}.${ext}`, { type: blob.type });
        });
        const files = await Promise.all(filePromises);

        const shareData: ShareData = {
          title: product.name,
          text: `✨ *${product.name}*\nCode: ${product.id}${product.price ? `\nPrice: ₹${product.price}` : ''}\n\nCheck it out!`,
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

    // Fallback: share link (desktop or unsupported browsers)
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
              <p className="text-xs text-text-secondary">
                {t('estimatedFor')} {quantity} {product.sareeSet ? 'Set(s)' : t('pcLabel')}: {formatInr(product.price * quantity)}
              </p>
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
                      router.push(`/products/${p.id}`);
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

          <hr className="border-divider" />

          {/* Quantity Selector */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-text-primary">{t('quantity')}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 border border-divider rounded-full flex items-center justify-center text-lg hover:bg-cream-deep transition"
              >
                −
              </button>
              <span className="text-base font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={() => {
                  const maxQty = product.stock && product.stock > 0 ? product.stock : 999;
                  setQuantity(q => Math.min(maxQty, q + 1));
                }}
                className="w-10 h-10 border border-divider rounded-full flex items-center justify-center text-lg hover:bg-cream-deep transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Note to shop */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-text-primary">{t('noteToShop')}</span>
            <textarea
              className="w-full rounded-input border border-divider bg-surface px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
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
              disabled={product.stock === 0 || isOrdering}
              className={`w-full h-14 ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : isOrdering ? 'bg-gradient-to-r from-[#1B8C4D] to-[#25D366] text-white opacity-80 cursor-wait' : 'bg-gradient-to-r from-[#1B8C4D] to-[#25D366] text-white hover:shadow-lg'} rounded-[18px] font-bold text-base shadow-md transition flex items-center justify-center gap-2`}
            >
              {isOrdering ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Preparing photos…
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  {product.stock === 0 ? 'Out of Stock' : t('whatsappOrder')}
                </>
              )}
            </button>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full h-14 ${product.stock === 0 ? 'border-2 border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-2 border-maroon text-maroon hover:bg-peach transition'} rounded-[18px] font-bold text-base`}
            >
              {product.stock === 0 ? 'Out of Stock' : t('addToCart')}
            </button>
          </div>
        </div>
      </div>

      {/* Address Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-surface rounded-[24px] border border-divider shadow-xl overflow-hidden p-6 space-y-6 animate-scaleIn">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl font-bold text-text-primary">
                Add Shipping Address
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-cream-deep hover:bg-divider transition text-text-secondary font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-text-secondary">
              Please provide a shipping address before completing your order via WhatsApp.
            </p>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                  Delivery Address
                </label>
                <textarea
                  className="input-field min-h-[100px] resize-none"
                  placeholder="Enter your complete address..."
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSavingAddress || !buyerAddress.trim()}
                className="btn-primary w-full h-12"
              >
                {isSavingAddress ? 'Saving...' : 'Save Address & Proceed'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
