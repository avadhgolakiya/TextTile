/** Public Firebase web config — safe to expose in client + service worker. */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCWJIzdi6fk8mJELJAWRTD7-6AvK3SFkeI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'texttile-253c7.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'texttile-253c7',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'texttile-253c7.firebasestorage.app',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '132788988984',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:132788988984:web:637aa3b7f15484c6cd8acd',
};

export const firebaseVapidKey =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
  'BOZEg69WxqM1UVurD7-SIjYcyLg-m_YAe7Crh-zsKVpQm5uHB7w7IrHEakVKgJHDOck5j8ixH9Xs3WQspMoGL0M';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseVapidKey,
  );
}
