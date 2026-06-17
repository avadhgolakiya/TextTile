'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 1. Register the service worker unconditionally on window load
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.error('[PWA] Service Worker registration failed:', err);
        });
    }

    // Check if already in standalone app mode
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone === true);

    if (isStandalone) return;

    // Detect iOS/iPadOS (including iPadOS reporting as MacIntel)
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (isDismissed) return;

    // If iOS Safari, show the guide banner after a slight delay
    if (isIOS) {
      const timer = setTimeout(() => setShowInstallBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // Otherwise, listen for standard Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the browser install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);
    
    // Clear prompt state
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;
  if (pathname?.startsWith('/shared')) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[999] max-w-md animate-slide-up rounded-card border border-divider bg-cream-deep p-5 shadow-2xl backdrop-blur-md md:bottom-6 md:right-6 md:left-auto">
      <div className="flex items-start gap-4">
        {/* App Logo */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gold/30 shadow-md">
          <Image
            src="/icon-192.png"
            alt="Swastik Fashion Logo"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Text Details */}
        <div className="flex-1">
          <h3 className="font-serif text-base font-bold text-text-primary">
            Install Swastik Fashion
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-text-secondary">
            {isIOSDevice
              ? 'Tap the Safari Share button (the square icon with an upward arrow at the bottom of the screen) and select "Add to Home Screen" to install.'
              : 'Add Swastik Fashion to your home screen for quick access to wholesale sarees.'}
          </p>

          <div className="mt-3.5 flex items-center gap-3">
            {!isIOSDevice && (
              <button
                onClick={handleInstallClick}
                className="rounded-full bg-maroon px-4 py-1.5 text-xs font-bold text-white transition hover:bg-maroon-dark shadow-sm active:scale-95"
              >
                Install Now
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="rounded-full border border-divider bg-surface px-4 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-cream hover:text-text-primary active:scale-95"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Close icon */}
        <button
          onClick={handleDismiss}
          className="text-text-secondary/70 hover:text-text-primary transition"
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
