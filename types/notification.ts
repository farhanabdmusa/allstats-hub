import { notification } from "@prisma/client";
import { Topic } from "./topic";

export interface Notification {
  id: number;
  id_title: string;
  id_content: string;
  id_short_description?: string | null;
  en_title: string;
  en_content: string;
  en_short_description?: string | null;
  mfd?: string | null;
  notification_topic?: { topic: Topic }[];
  push_notification: boolean;
  timestamp: Date;
  notification_sent?: Date | null;
  action: boolean;
  type?: notification["type"] | null;
  product_id?: string | null;
  product_mfd?: string | null;
}

export interface GeneratedNotification {
  type: string;
  id_title: string;
  id_description: string;
  id_short_description: string;
  en_title: string;
  en_description: string;
  en_short_description: string;
}

export interface GeneratedNotificationResponse {
  model?: string;
  data: GeneratedNotification[];
}
