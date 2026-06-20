'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { firebaseConfig, firebaseVapidKey, isFirebaseConfigured } from './firebase-config';

let messagingInstance: ReturnType<typeof getMessaging> | null = null;

function getFirebaseMessaging() {
  if (!isFirebaseConfigured()) return null;
  if (typeof window === 'undefined') return null;

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
}

/** Request permission, get FCM token, register with backend. */
export async function setupPushNotifications(
  registerToken: (token: string) => Promise<void>,
): Promise<string | null> {
  if (!(await isSupported())) return null;
  if (!isFirebaseConfigured()) return null;
  if (!('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js',
    { scope: '/' },
  );
  await navigator.serviceWorker.ready;

  const messaging = getFirebaseMessaging();
  if (!messaging) return null;

  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration: registration,
  });

  if (token) {
    await registerToken(token);
  }

  return token;
}

/** Show in-app toast when a push arrives while the tab is open. */
export function onForegroundMessage(handler: (title: string, body: string) => void) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'Swastik Fashion';
    const body = payload.notification?.body ?? 'New update available';
    handler(title, body);
  });
}
