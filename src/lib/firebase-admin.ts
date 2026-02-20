/**
 * firebase-admin.ts — Firebase Admin SDK initialization for Next.js API routes
 *
 * Uses a singleton pattern to avoid re-initializing on hot reloads.
 * Service account JSON is read from FIREBASE_SERVICE_ACCOUNT_JSON env var.
 */

import { initializeApp, cert, getApps, getApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// ==========================================
// Initialization
// ==========================================

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. " +
        "Add your Firebase service account JSON to .env.local"
    );
  }

  let serviceAccount: object;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON. " +
        "Make sure the entire service account JSON is on one line in .env.local"
    );
  }

  return initializeApp({
    credential: cert(serviceAccount as Parameters<typeof cert>[0]),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

// ==========================================
// Exported helpers
// ==========================================

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded token (including uid).
 *
 * @throws if the header is missing or the token is invalid/expired.
 */
export async function verifyBearerToken(
  authHeader: string | null
): Promise<import("firebase-admin/auth").DecodedIdToken> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or malformed Authorization header. Expected: Bearer <token>");
  }

  const token = authHeader.slice(7);
  const adminAuth = getAdminAuth();

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid or expired Firebase ID token: ${message}`);
  }
}
