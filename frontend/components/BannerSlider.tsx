'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { isValidImageUrl, isVideoUrl, getFullImageUrl } from '@/lib/image';
import { FALLBACK_BANNER } from '@/lib/constants/sample-data';

type Props = {
  banners: { image_url: string; redirect_url?: string }[];
  isAdmin?: boolean;
};

export function BannerSlider({ banners, isAdmin = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const list = banners.length ? banners : [{ image_url: FALLBACK_BANNER }];

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (list.length <= 1) return;
    
    // Check if the currently active slide is a video
    const currentBanner = list[currentIndex];
    const isCurrentVideo = currentBanner ? isVideoUrl(currentBanner.image_url) : false;
    
    // Only schedule auto-advance if the current slide is not a video
    if (!isCurrentVideo) {
      autoplayTimerRef.current = setInterval(nextSlide, 3000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [currentIndex, list.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    stopAutoplay();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    startAutoplay();
  };

  return (
    <div 
      className="relative aspect-[21/9] w-full overflow-hidden rounded-card group shadow-sm border border-divider/30"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      {/* Slides Container */}
      <div className="w-full h-full relative">
        {list.map((banner, index) => {
          const active = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {banner.redirect_url ? (
                <a href={banner.redirect_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-pointer">
                  {isVideoUrl(banner.image_url) ? (
                    active ? (
                      <video
                        src={getFullImageUrl(banner.image_url)}
                        autoPlay
                        muted
                        playsInline
                        onEnded={nextSlide}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream-deep" />
                    )
                  ) : (
                    <Image
                      src={isValidImageUrl(banner.image_url) ? banner.image_url : FALLBACK_BANNER}
                      alt={`Promo banner ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  )}
                </a>
              ) : (
                <div className="w-full h-full relative">
                  {isVideoUrl(banner.image_url) ? (
                    active ? (
                      <video
                        src={getFullImageUrl(banner.image_url)}
                        autoPlay
                        muted
                        playsInline
                        onEnded={nextSlide}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream-deep" />
                    )
                  ) : (
                    <Image
                      src={isValidImageUrl(banner.image_url) ? banner.image_url : FALLBACK_BANNER}
                      alt={`Promo banner ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Quick Link */}
      {isAdmin && (
        <Link
          href="/admin?tab=banners"
          className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-surface px-4 py-2 text-xs font-bold text-maroon shadow-md backdrop-blur-sm transition active:scale-95 duration-200"
        >
          <span>⚙️</span> Manage Banners
        </Link>
      )}

      {/* Navigation Arrows (Desktop hover) */}
      {list.length > 1 && (
        <>
          <button
            onClick={() => { prevSlide(); startAutoplay(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition duration-200"
            aria-label="Previous banner"
          >
            ‹
          </button>
          <button
            onClick={() => { nextSlide(); startAutoplay(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden group-hover:flex h-10 w-10 items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white transition duration-200"
            aria-label="Next banner"
          >
            ›
          </button>
        </>
      )}

      {/* Indicator Dots */}
      {list.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {list.map((_, index) => {
            const active = index === currentIndex;
            return (
              <button
                key={index}
                onClick={() => { setCurrentIndex(index); startAutoplay(); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active ? 'bg-surface w-6' : 'bg-white/40 hover:bg-white/60 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
