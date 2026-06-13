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
