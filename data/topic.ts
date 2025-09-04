"use server"

import prisma from "@/lib/prisma";
import { Topic } from "@/types/topic";
import { SortingState } from "@tanstack/react-table";

export async function countAllTopic() {
    const count = await prisma.topic.count();
    return count;
}

export async function getAllTopic(pageSize?: number, page?: number, sort?: SortingState) {
    const flatSort = sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
    const topics = await prisma.topic.findMany({
        orderBy: flatSort,
        take: pageSize,
        skip: page && pageSize ? page * pageSize : undefined,
    });
    return topics;
}

export async function createTopic(data: Omit<Topic, "id">) {
    try {
        const topic = await prisma.topic.create({
            data,
        });
        return topic;
    } catch (error) {
        console.error("Failed to create topic:", error);
        throw new Error("Failed to create topic");
    }
}

export async function updateTopic(id: number, data: Omit<Topic, "id">) {
    try {
        const topic = await prisma.topic.update({
            where: { id },
            data,
        });
        return topic;
    } catch (error) {
        console.error("Failed to update topic:", error);
        throw new Error("Failed to update topic");
    }
}

export async function getTopic(id: number) {
    return prisma.topic.findUnique({
        where: { id },
    });
}