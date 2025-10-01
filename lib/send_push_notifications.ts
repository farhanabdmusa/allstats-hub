
import { fcm } from "@/lib/firebase_admin";
import { MulticastMessage } from "firebase-admin/messaging";

interface PushNotificationPayload {
    title: string;
    body: string;
    data?: { [key: string]: string };
}

export class PushNotificationService {
    static async sendNotificationMultiToken(
        listToken: string[],
        payload: PushNotificationPayload,
    ): Promise<void> {
        const message: MulticastMessage = {
            tokens: listToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            android: {
                priority: "high",
                notification: {
                    channelId: "default_channel",
                    sound: "default",
                },
            },
            data: payload.data ?? {},
        };

        try {
            const response = await fcm.sendEachForMulticast(message);
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(listToken[idx]);
                    }
                });
                console.warn('Some tokens failed to receive the notification:', failedTokens);
            }
            console.log('Push notification sent successfully:', response);
        } catch (error) {
            console.error('Failed to send push notification:', error);
            throw error;
        }
    }
}