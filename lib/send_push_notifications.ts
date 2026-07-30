import { fcm } from "@/lib/firebase_admin";
import { ConditionMessage, MulticastMessage } from "firebase-admin/messaging";
import prisma from "./prisma";

interface PushNotificationPayload {
  id_title: string;
  id_body: string;
  en_title: string;
  en_body: string;
  data?: Record<string, string>;
  sound?: string;
  channelId?: string;
}

export class PushNotificationService {
  private static buildBaseMessage(
    locale: "en" | "id",
    payload: PushNotificationPayload,
  ): {
    notification: {
      title: string;
      body: string;
    };
    android: {
      priority?: "high" | "normal";
      notification: {
        channelId: string;
        sound: string;
      };
    };
    apns: {
      headers: {
        "apns-priority": string;
      };
      payload: {
        aps: {
          sound: string;
        };
      };
    };
    data: Record<string, string>;
  } {
    return {
      notification: {
        title: locale == "en" ? payload.en_title : payload.id_title,
        body: locale == "en" ? payload.en_body : payload.id_body,
      },
      android: {
        priority: "high",
        notification: {
          channelId: payload.channelId ?? "default_channel",
          sound: payload.sound ?? "default",
        },
      },
      apns: {
        headers: { "apns-priority": "10" },
        payload: {
          aps: {
            sound: payload.sound ?? "default",
          },
        },
      },
      data: payload.data ?? {},
    };
  }

  /**
   * Sends notifications to a batch of device tokens.
   * Collects stale tokens and fires a database delete query asynchronously.
   */
  static async sendNotificationMultiToken({
    idTokens,
    enTokens,
    payload,
  }: Readonly<{
    idTokens: string[];
    enTokens: string[];
    payload: PushNotificationPayload;
  }>): Promise<{ success: boolean; staleTokens: string[] }> {
    if (idTokens.length === 0 && enTokens.length === 0) {
      return { success: false, staleTokens: [] };
    }

    if (idTokens.length > 500 || enTokens.length > 500) {
      throw new Error(
        "FCM multicast token count exceeds the maximum limit of 500 tokens.",
      );
    }

    try {
      const staleTokens: string[] = [];
      let successCount = 0;

      // Broadcast to Indonesian users
      if (idTokens.length > 0) {
        const baseMessage = this.buildBaseMessage("id", payload);

        const message: MulticastMessage = {
          tokens: idTokens,
          ...baseMessage,
        };

        const response = await fcm.sendEachForMulticast(message);

        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success && resp.error) {
              const errorCode = resp.error.code;
              if (
                errorCode === "messaging/invalid-registration-token" ||
                errorCode === "messaging/registration-token-not-registered"
              ) {
                staleTokens.push(idTokens[idx]);
              }
            }
          });

          console.warn(
            `[FCM] Batch partial failure: ${response.failureCount}/${idTokens.length} failed. Dead tokens found: ${staleTokens.length}`,
          );
        }
        successCount += response.successCount;
      }

      // Broadcast to English users
      if (enTokens.length > 0) {
        const baseMessage = this.buildBaseMessage("en", payload);

        const message: MulticastMessage = {
          tokens: enTokens,
          ...baseMessage,
        };

        const response = await fcm.sendEachForMulticast(message);

        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success && resp.error) {
              const errorCode = resp.error.code;
              if (
                errorCode === "messaging/invalid-registration-token" ||
                errorCode === "messaging/registration-token-not-registered"
              ) {
                staleTokens.push(enTokens[idx]);
              }
            }
          });

          console.warn(
            `[FCM] Batch partial failure: ${response.failureCount}/${enTokens.length} failed. Dead tokens found: ${staleTokens.length}`,
          );
        }
        successCount += response.successCount;
      }

      if (staleTokens.length > 0) {
        prisma.user_device
          .deleteMany({
            where: { fcm_token: { in: staleTokens } },
          })
          .then((res) => {
            console.log(`[DB] Successfully purged ${res.count} stale tokens.`);
          })
          .catch((err) => {
            console.error(
              "[DB] Failed to purge stale tokens asynchronously:",
              err,
            );
          });
      }

      return {
        success: successCount > 0,
        staleTokens,
      };
    } catch (error) {
      console.error("Critical failure executing FCM multicast:", error);
      throw error;
    }
  }

  /**
   * Sends a notification targeted to a combination of topics.
   */
  static async sendNotificationToTopic({
    topics,
    mfd,
    payload,
  }: Readonly<{
    mfd?: string;
    topics: string[];
    payload: PushNotificationPayload;
  }>): Promise<boolean> {
    if (!topics || topics.length === 0) {
      return false;
    }

    try {
      const topicCondition = topics.map((t) => `'${t}' in topics`).join(" || ");
      const mfdCondition = mfd ? `mfd_${mfd} in topics` : undefined;

      // Send notification for Indonesian Users
      const idBaseMessage = this.buildBaseMessage("id", payload);
      const idLangConditions = "'lang_id' in topics";
      const idConditions = [topicCondition, idLangConditions, mfdCondition];

      const idMessage: ConditionMessage = {
        condition: idConditions.filter(Boolean).join(" && "),
        ...idBaseMessage,
      };

      const idResponse = await fcm.send(idMessage);
      console.log(
        "Topic notification for Indonesian Users dispatched effectively:",
        idResponse,
      );

      // Send notification for English Users
      const enBaseMessage = this.buildBaseMessage("en", payload);
      const enLangConditions = "'lang_en' in topics";
      const enConditions = [topicCondition, enLangConditions, mfdCondition];

      const enMessage: ConditionMessage = {
        condition: enConditions.filter(Boolean).join(" && "),
        ...enBaseMessage,
      };

      const enResponse = await fcm.send(enMessage);
      console.log(
        "Topic notification for English Users dispatched effectively:",
        enResponse,
      );

      return true;
    } catch (error) {
      console.error("Failed executing FCM topic dispatch:", error);
      throw error;
    }
  }

  /**
   * Sends a notification to all users.
   */
  static async sendNotificationToAllUsers({
    mfd,
    payload,
  }: Readonly<{
    mfd?: string;
    payload: PushNotificationPayload;
  }>): Promise<boolean> {
    try {
      const allUsersCondition = "'all_users' in topics";
      const mfdCondition = mfd ? `'mfd_${mfd}' in topics` : undefined;

      // Send notification for Indonesian Users
      const idBaseMessage = this.buildBaseMessage("id", payload);
      const idLangConditions = "'lang_id' in topics";
      const idConditions = [allUsersCondition, idLangConditions, mfdCondition];

      const idMessage: ConditionMessage = {
        condition: idConditions.filter(Boolean).join(" && "),
        ...idBaseMessage,
      };

      const idResponse = await fcm.send(idMessage);
      console.log(
        "Topic notification for Indonesian Users dispatched effectively:",
        idResponse,
      );

      // Send notification for English Users
      const enBaseMessage = this.buildBaseMessage("en", payload);
      const enLangConditions = "'lang_en' in topics";
      const enConditions = [allUsersCondition, enLangConditions, mfdCondition];

      const enMessage: ConditionMessage = {
        condition: enConditions.filter(Boolean).join(" && "),
        ...enBaseMessage,
      };

      const enResponse = await fcm.send(enMessage);
      console.log(
        "Topic notification for English Users dispatched effectively:",
        enResponse,
      );

      return true;
    } catch (error) {
      console.error("Failed executing FCM topic dispatch:", error);
      throw error;
    }
  }
}
