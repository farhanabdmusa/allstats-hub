import { initializeApp, cert } from "firebase-admin/app";
import { apps } from "firebase-admin";
import { getMessaging, Messaging } from "firebase-admin/messaging";

let fcmInstance: Messaging | null = null;

function ensureFirebaseInitialized() {
  if (fcmInstance) {
    return;
  }

  if (!apps.length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      return;
    }

    initializeApp({
      credential: cert({
        clientEmail,
        privateKey,
        projectId,
      }),
    });
  }

  if (apps.length) {
    fcmInstance = getMessaging();
  }
}

function getFcm() {
  ensureFirebaseInitialized();

  if (!fcmInstance) {
    throw new Error(
      "Firebase admin is not initialized. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  return fcmInstance;
}

export const fcm = new Proxy({} as Messaging, {
  get(_, prop) {
    return (getFcm() as any)[prop];
  },
});
