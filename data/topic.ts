"use server"

import prisma from "@/lib/prisma";
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