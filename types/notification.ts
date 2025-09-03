import { Topic } from "./topic";

export interface Notification {
    id: number;
    title: string;
    content: string;
    topics?: Topic[];
    push_notification: boolean;
    timestamp: Date;
    notification_sent?: Date;
};