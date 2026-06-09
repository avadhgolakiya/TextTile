import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let initialized = false;
let initFailed = false;

/** Initialize Firebase Admin SDK from env or service-account JSON path. */
export function getFirebaseAdmin() {
  if (initFailed) return null;
  if (initialized) return admin;

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    try {
      let resolvedPath = path.resolve(process.cwd(), credPath);
      if (!existsSync(resolvedPath)) {
        // Fallback: resolve relative to backend root directory
        const backendRoot = path.join(__dirname, '..', '..');
        resolvedPath = path.resolve(backendRoot, credPath);
      }

      const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      return admin;
    } catch (err) {
      console.error('[FCM] Failed to initialize Firebase Admin from GOOGLE_APPLICATION_CREDENTIALS:', err);
      initFailed = true;
      return null;
    }
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
