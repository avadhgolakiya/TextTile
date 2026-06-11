'use client';

import { useEffect, useState } from 'react';
import { notificationApi } from '@/lib/api-client';
import { isFirebaseConfigured } from '@/lib/firebase-config';
import {
  onForegroundMessage,
  setupPushNotifications,
} from '@/lib/firebase-messaging';
import { toast } from '@/lib/toast';

const STORAGE_KEY = 'fcm-token-registered';
const DISMISSED_KEY = 'pwa-notification-prompt-dismissed';

/** Requests notification permission and registers FCM token with custom pre-prompt dialog. */
export function NotificationSetup() {
  const [showGuide, setShowGuide] = useState(false);
  const [showPrePrompt, setShowPrePrompt] = useState(false);

  useEffect(() => {
    const handleShowGuide = () => setShowGuide(true);
    window.addEventListener('show-pwa-notification-guide', handleShowGuide);
    return () => {
      window.removeEventListener('show-pwa-notification-guide', handleShowGuide);
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    onForegroundMessage((title, body) => {
      // Show real system notification in the notification bar
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready
            .then((registration) => {
              registration.showNotification(title, {
                body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
              });
            })
            .catch(() => {
              new Notification(title, { body });
            });
        } else {
          new Notification(title, { body });
        }
      }
      // Show in-app toast as well
      toast.info(`${title}: ${body}`);
    });

    const alreadyRegistered = sessionStorage.getItem(STORAGE_KEY);
    if (alreadyRegistered) return;

    // Gracefully check permissions before prompting native UI automatically
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const isDismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (!isDismissed) {
          // Delay presentation for a smoother loading sequence
          const timer = setTimeout(() => setShowPrePrompt(true), 4000);
          return () => clearTimeout(timer);
        }
      } else if (Notification.permission === 'granted') {
        // Silently register token
        triggerSetupSilently();
      }
    }
  }, []);

  async function triggerSetupSilently() {
    try {
      await setupPushNotifications(async (token) => {
        await notificationApi.registerToken(token);
        sessionStorage.setItem(STORAGE_KEY, token);
      });
    } catch (err) {
      console.warn('[FCM] Silent registration failed:', err);
    }
  }

  const handleAllowClick = async () => {
    setShowPrePrompt(false);
    try {
      const token = await setupPushNotifications(async (t) => {
        await notificationApi.registerToken(t);
        sessionStorage.setItem(STORAGE_KEY, t);
      });

      if (token) {
        toast.success('Background notifications enabled!');
        setShowGuide(true); // Open lock-screen settings instruction guide
      }
    } catch (err) {
      console.error('[FCM] Setup failed from user prompt:', err);
      toast.error('Failed to enable background notifications.');
    }
  };

  const handleDismissPrePrompt = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setShowPrePrompt(false);
  };

  return (
    <>
      {/* 1. Custom Pre-permission Banner for locked-screen alerts */}
      {showPrePrompt && (
        <div className="fixed top-4 left-4 right-4 z-[999] max-w-md mx-auto animate-slide-up rounded-card border border-gold/30 bg-cream-deep p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl mt-1 select-none">🔔</span>
            <div className="flex-1">
              <h4 className="font-serif text-sm font-bold text-text-primary">
                Allow Background Alerts?
              </h4>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-0.5">
                Receive instant saree drop alerts on your phone even when your browser is closed or your screen is locked.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAllowClick}
                  className="rounded-full bg-maroon px-4 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-maroon-dark transition active:scale-95"
                >
                  Enable Alerts
                </button>
                <button
                  onClick={handleDismissPrePrompt}
                  className="rounded-full border border-divider bg-white px-4 py-1.5 text-[11px] font-medium text-text-secondary hover:bg-cream transition active:scale-95"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissPrePrompt}
              className="text-text-secondary/70 hover:text-text-primary transition p-0.5"
              aria-label="Dismiss prompt"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 2. Lock screen instructions guide */}
      {showGuide && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cream border border-divider rounded-card max-w-md w-full shadow-2xl p-6 relative animate-slide-up">
            {/* Close Button */}
            <button
              onClick={() => setShowGuide(false)}
              className="absolute right-4 top-4 text-text-secondary hover:text-maroon text-lg p-1.5 transition"
              aria-label="Close guide"
            >
              ✕
            </button>

            {/* Title */}
            <div className="text-center space-y-1">
              <span className="text-4xl select-none">🔒</span>
              <h3 className="font-serif text-xl font-bold text-text-primary mt-2">
                Lock Screen Notifications
              </h3>
              <p className="text-xs text-text-secondary">
                Ensure saree updates arrive on your phone even when the screen is locked!
              </p>
            </div>

            {/* Content steps */}
            <div className="mt-6 space-y-4">
              {/* Step 1 */}
              <div className="flex gap-3">
                <span className="text-sm bg-gold/10 text-gold h-7 w-7 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">Install to Home Screen</h4>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    For iPhones and iPads, push notifications <strong>only work</strong> after you add Swastik Fashion to your Home Screen. Use Safari menu (⎋) → <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <span className="text-sm bg-gold/10 text-gold h-7 w-7 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">Allow Background Refresh</h4>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Ensure <strong>Background App Refresh</strong> is turned on in your device settings for Safari/Chrome to let the app receive alerts when minimized.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <span className="text-sm bg-gold/10 text-gold h-7 w-7 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">Disable Battery Optimizations</h4>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    On Android: Go to <strong>Settings</strong> → <strong>Apps</strong> → <strong>Chrome</strong> → <strong>Battery</strong> → select <strong>&ldquo;Unrestricted&rdquo;</strong> so the OS doesn't sleep notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowGuide(false)}
              className="btn-primary w-full h-12 mt-6"
            >
              Got It, Settings Checked!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
