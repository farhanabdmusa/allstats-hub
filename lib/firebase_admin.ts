import { apps, messaging } from "firebase-admin";
import { initializeApp, cert, } from "firebase-admin/app"

if (!apps.length) {
    initializeApp({
        credential: cert({
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            projectId: process.env.FIREBASE_PROJECT_ID,
        })
    });
}

export const fcm = messaging();
