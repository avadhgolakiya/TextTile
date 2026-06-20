/** Public Firebase web config — safe to expose in client + service worker. */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '132788988984',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const firebaseVapidKey =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ??
  'BOZEg69WxqM1UVurD7-SIjYcyLg-m_YAe7Crh-zsKVpQm5uHB7w7IrHEakVKgJHDOck5j8ixH9Xs3WQspMoGL0M';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseVapidKey,
  );
}
