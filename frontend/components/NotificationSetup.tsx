'use client';

import { useEffect } from 'react';
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
                icon: '/assets/icon/app_icon.jpeg',
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
    }).catch((err) => {
      console.warn('[FCM] setup failed:', err);
    });
  }, []);

  return null;
}
