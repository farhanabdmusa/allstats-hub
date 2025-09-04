"use server"

import prisma from "@/lib/prisma";
import { Notification } from "@/types/notification";
import { SortingState } from "@tanstack/react-table";

export async function countNotifications() {
    return prisma.notification.count();
}

export async function getNotifications(pageSize: number, page: number, sort: SortingState): Promise<Notification[]> {
    const flatSort = sort.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
    const notifications = await prisma.notification.findMany({
        select: {
            id: true,
            title: true,
            content: true,
            push_notification: true,
            timestamp: true,
            notification_topic: {
                select: {
                    topic: true
                }
            }
        },
        orderBy: flatSort,
        take: pageSize,
        skip: page * pageSize,
    });
    return notifications;
}

export async function createNotification(
    data: Omit<Notification, "id" | "timestamp" | "notification_sent" | "topics"> & { topics?: number[] }
) {
    try {
        const { topics, push_notification, ...rest } = data;
        return await prisma.notification.create({
            select: { title: true },
            data: {
                ...rest,
                push_notification,
                notification_topic: push_notification && topics && topics.length > 0
                    ? {
                        createMany: {
                            data: topics.map(id_topic => ({ id_topic }))
                        }
                    }
                    : undefined
            },
        });
    } catch (error) {
        console.error("Failed to create notification:", error);
        throw new Error("Failed to create notification");
    }
}

export async function getNotification(id: number) {
    return prisma.notification.findUnique({
        select: {
            title: true,
            content: true,
            push_notification: true,
            notification_topic: {
                select: {
                    topic: true,
                }
            }
        },
        where: { id },
    });
}

export async function updateNotification(id: number, data: Omit<Notification, "id" | "timestamp" | "notification_sent" | "topics"> & { topics?: number[] }) {
    try {
        const { topics, push_notification, ...rest } = data;
        return await prisma.notification.update({
            where: { id },
            data: {
                ...rest,
                notification_topic: push_notification && topics && topics.length > 0
                    ? {
                        deleteMany: {
                            id_notification: id,
                        },
                        createMany: {
                            data: topics.map(id_topic => ({ id_topic }))
                        }
                    }
                    : undefined
            },
        });
    } catch (error) {
        console.log("🚀 ~ updateNotification ~ error:", error);
        throw new Error("Failed to update notification");
    }
}