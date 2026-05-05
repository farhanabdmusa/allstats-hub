"use server";

import prisma from "@/lib/prisma";
import { PushNotificationService } from "@/lib/send_push_notifications";
import { Notification } from "@/types/notification";
import { SortingState } from "@tanstack/react-table";

export async function countNotifications() {
  return prisma.notification.count();
}

export async function getNotifications(
  pageSize: number,
  page: number,
  sort: SortingState,
): Promise<Notification[]> {
  const flatSort = sort.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
  const notifications = await prisma.notification.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      push_notification: true,
      timestamp: true,
      notification_sent: true,
      short_description: true,
      notification_topic: {
        select: {
          topic: true,
        },
      },
    },
    orderBy: flatSort,
    take: pageSize,
    skip: page * pageSize,
  });
  return notifications;
}

export async function createNotification(
  data: Omit<
    Notification,
    "id" | "timestamp" | "notification_sent" | "topics"
  > & { topics?: number[] },
) {
  try {
    const { topics, push_notification, ...rest } = data;
    if (
      push_notification &&
      (!data.short_description || data.short_description.length === 0)
    ) {
      throw new Error(
        "Short description is required when push notification is enabled",
      );
    }
    const create = await prisma.notification.create({
      select: { id: true, title: true },
      data: {
        ...rest,
        push_notification,
        notification_topic:
          push_notification && topics && topics.length > 0
            ? {
                createMany: {
                  data: topics.map((id_topic) => ({ id_topic })),
                },
              }
            : undefined,
      },
    });

    if (data.push_notification) {
      if (data.topics?.length ?? 0 > 0) {
        const topics = await prisma.topic.findMany({
          where: {
            id: {
              in: data.topics,
            },
          },
        });
        const send = await PushNotificationService.sendNotificationToTopic({
          topics: topics.map((e) => e.name),
          payload: {
            title: data.title,
            body: data.short_description!,
          },
        });
        if (send) {
          await prisma.notification.update({
            where: { id: create.id },
            data: {
              notification_sent: new Date(),
            },
          });
        }
      } else {
        const listTokens = await prisma.user_device.findMany({
          select: {
            fcm_token: true,
          },
          where: {
            fcm_token: { not: null },
          },
        });
        if (listTokens.length > 0) {
          const send = await PushNotificationService.sendNotificationMultiToken(
            listTokens.map((user) => user.fcm_token) as string[],
            {
              title: data.title,
              body: data.short_description!,
            },
          );
          if (send) {
            await prisma.notification.update({
              where: { id: create.id },
              data: {
                notification_sent: new Date(),
              },
            });
          }
        }
      }
    }

    return {
      title: create.title,
    };
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
        },
      },
    },
    where: { id },
  });
}

export async function updateNotification(
  id: number,
  data: Omit<
    Notification,
    "id" | "timestamp" | "notification_sent" | "topics"
  > & { topics?: number[] },
) {
  try {
    const { topics, push_notification, ...rest } = data;
    return await prisma.notification.update({
      where: { id },
      data: {
        ...rest,
        push_notification: push_notification,
        notification_topic:
          push_notification && topics && topics.length > 0
            ? {
                deleteMany: {
                  id_notification: id,
                },
                createMany: {
                  data: topics.map((id_topic) => ({ id_topic })),
                },
              }
            : undefined,
      },
    });
  } catch (error) {
    console.log("🚀 ~ updateNotification ~ error:", error);
    throw new Error("Failed to update notification");
  }
}

export async function deleteNotification(id: number) {
  try {
    await prisma.notification.delete({
      where: { id },
      select: { title: true },
    });
    return true;
  } catch (error) {
    console.log("🚀 ~ updateNotification ~ error:", error);
    return false;
    // throw new Error("Failed to update notification");
  }
}

export async function resendNotification(id: number) {
  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id: id,
      },
      include: {
        notification_topic: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (notification == null) {
      throw new Error("Notification not found");
    }
    if (!notification.push_notification) {
      throw new Error("This notification doesn't a push notification");
    }
    if (notification.push_notification) {
      if (notification.notification_topic?.length ?? 0 > 0) {
        const topics = await prisma.topic.findMany({
          where: {
            id: {
              in: notification.notification_topic.map((e) => e.topic.id),
            },
          },
        });
        const send = await PushNotificationService.sendNotificationToTopic({
          topics: topics.map((e) => e.name),
          payload: {
            title: notification.title,
            body: notification.short_description!,
          },
        });
        if (send) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              notification_sent: new Date(),
            },
          });
        }
        return send;
      } else {
        const listTokens = await prisma.user_device.findMany({
          select: {
            fcm_token: true,
          },
          where: {
            fcm_token: { not: null },
          },
        });
        if (listTokens.length > 0) {
          const send = await PushNotificationService.sendNotificationMultiToken(
            listTokens.map((user) => user.fcm_token) as string[],
            {
              title: notification.title,
              body: notification.short_description!,
            },
          );
          if (send) {
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                notification_sent: new Date(),
              },
            });
          }
          return send;
        }
      }
    }
  } catch (error) {
    console.error("Failed to resend notification:", error);
    throw new Error("Failed to resend notification");
  }
}
