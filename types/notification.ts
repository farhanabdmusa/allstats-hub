import { Topic } from "./topic";

export interface Notification {
  id: number;
  title: string;
  content: string;
  notification_topic?: { topic: Topic }[];
  push_notification: boolean;
  timestamp: Date;
  notification_sent?: Date | null;
  short_description?: string | null;
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
