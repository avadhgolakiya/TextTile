import admin from 'firebase-admin';
import { readFileSync } from 'fs';

let initialized = false;
let initFailed = false;

/** Initialize Firebase Admin SDK from env or service-account JSON path. */
export function getFirebaseAdmin() {
  if (initFailed) return null;
  if (initialized) return admin;

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    initialized = true;
    return admin;
  }

  initFailed = true;
  return null;
}

export function isFirebaseConfigured() {
  return getFirebaseAdmin() !== null;
}
