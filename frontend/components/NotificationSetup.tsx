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

/** Requests notification permission and registers FCM token once per session. */
export function NotificationSetup() {
  const [showGuide, setShowGuide] = useState(false);

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

    setupPushNotifications(async (token) => {
      await notificationApi.registerToken(token);
      sessionStorage.setItem(STORAGE_KEY, token);
      
      // Auto-trigger setup guide the first time notifications are successfully enabled!
      setShowGuide(true);
    }).catch((err) => {
      console.warn('[FCM] setup failed:', err);
    });
  }, []);

  if (!showGuide) return null;

  return (
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
  );
}
