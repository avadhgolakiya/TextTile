import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let initialized = false;
let initFailed = false;
let initError = null;
let diagnostics = {};

/** Initialize Firebase Admin SDK from env or service-account JSON path. */
export function getFirebaseAdmin() {
  if (initialized) return admin;

  diagnostics = {
    credPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || null,
    projectId: process.env.FIREBASE_PROJECT_ID || null,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || null,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
    privateKeyStartsWithQuote: process.env.FIREBASE_PRIVATE_KEY?.startsWith('"') || false,
    privateKeyEndsWithQuote: process.env.FIREBASE_PRIVATE_KEY?.endsWith('"') || false,
    privateKeyContainsBackslashN: process.env.FIREBASE_PRIVATE_KEY?.includes('\\n') || false,
    privateKeyContainsRealNewline: process.env.FIREBASE_PRIVATE_KEY?.includes('\n') || false,
  };

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    try {
      let resolvedPath = path.resolve(process.cwd(), credPath);
      if (!existsSync(resolvedPath)) {
        // Fallback: resolve relative to backend root directory
        const backendRoot = path.join(__dirname, '..', '..');
        resolvedPath = path.resolve(backendRoot, credPath);
      }

      diagnostics.resolvedCredPath = resolvedPath;
      diagnostics.credFileExists = existsSync(resolvedPath);

      if (existsSync(resolvedPath)) {
        const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        initialized = true;
        diagnostics.initializedMethod = 'file';
        return admin;
      } else {
        console.warn(`[FCM] GOOGLE_APPLICATION_CREDENTIALS file not found at: ${resolvedPath}. Attempting individual env fallback.`);
      }
    } catch (err) {
      console.error('[FCM] Failed to initialize Firebase Admin from file, attempting individual env fallback:', err);
      initError = err.message || String(err);
      diagnostics.fileInitError = initError;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    // If wrapped in quotes, strip them
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    // Replace literal '\n' sequences with real newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
      initialized = true;
      diagnostics.initializedMethod = 'env';
      return admin;
    } catch (err) {
      console.error('[FCM] Failed to initialize Firebase Admin from individual env variables:', err);
      initError = err.message || String(err);
      diagnostics.envInitError = initError;
    }
  }

  initFailed = true;
  diagnostics.failed = true;
  return null;
}

export function isFirebaseConfigured() {
  return getFirebaseAdmin() !== null;
}

export function getFirebaseDiagnostics() {
  // Ensure we try to initialize
  getFirebaseAdmin();
  return {
    configured: initialized,
    diagnostics,
    initError,
  };
}
