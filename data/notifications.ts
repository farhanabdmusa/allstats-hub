"use server"

import prisma from "@/lib/prisma";
import { SortingState } from "@tanstack/react-table";

export async function countNotifications() {
    return prisma.notification.count();
}

export async function getNotifications(pageSize: number, page: number, sort: SortingState) {
    const flatSort = sort.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
    const notifications = await prisma.notification.findMany({
        orderBy: flatSort,
        take: pageSize,
        skip: page * pageSize,
    });
    return notifications;
}

export async function createNotification(data: { title: string; content: string }) {
    try {
        return await prisma.notification.create({
            select: { title: true },
            data,
        });
    } catch (error) {
        console.log("🚀 ~ createNotification ~ error:", error)
        throw new Error("Failed to create notification");
    }
}