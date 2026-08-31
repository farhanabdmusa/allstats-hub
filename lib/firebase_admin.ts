import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

function initFcm(): Messaging {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (!clientEmail || !privateKey || !projectId) {
    throw new Error(
      "Firebase admin environment variables missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  const app =
    getApps().length === 0
      ? initializeApp({
          credential: cert({
            clientEmail,
            privateKey,
            projectId,
          }),
        })
      : getApp();

  return getMessaging(app);
}

export function getFcm(): Messaging {
  return initFcm();
}

export const fcm = {
  send: (...args: Parameters<Messaging["send"]>) => getFcm().send(...args),
  sendEachForMulticast: (
    ...args: Parameters<Messaging["sendEachForMulticast"]>
  ) => getFcm().sendEachForMulticast(...args),
};
