import { Topic } from "./topic";

export interface Notification {
    id: number;
    title: string;
    content: string;
    notification_topic?: { topic: Topic }[];
    push_notification: boolean;
    timestamp: Date;
    notification_sent?: Date;
    short_description?: string;
};