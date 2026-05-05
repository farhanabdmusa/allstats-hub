import { fcm } from "@/lib/firebase_admin";
import { ConditionMessage, MulticastMessage } from "firebase-admin/messaging";

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export class PushNotificationService {
  static async sendNotificationMultiToken(
    listToken: string[],
    payload: PushNotificationPayload,
  ): Promise<boolean> {
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
        console.warn(
          "Some tokens failed to receive the notification:",
          failedTokens,
        );
      }
      console.log("Push notification sent successfully:", response);
      return true;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      throw error;
    }
  }

  static async sendNotificationToTopic({
    topics,
    payload,
  }: Readonly<{
    topics: string[];
    payload: PushNotificationPayload;
  }>) {
    const condition = topics.map((t) => `'${t}' in topics`).join(" || ");
    console.log(
      "🚀 ~ PushNotificationService ~ sendNotificationToTopic ~ condition:",
      condition,
    );
    const message: ConditionMessage = {
      condition: condition,
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
        data: payload.data,
      },
    };

    try {
      const response = await fcm.send(message);
      console.log("Push notification sent successfully:", response);
      return true;
    } catch (error) {
      console.error("Failed to send push notification:", error);
      throw error;
    }
  }
}
