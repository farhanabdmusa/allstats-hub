"use server"

import prisma from "@/lib/prisma";

export async function getAllTopic() {
    const topics = await prisma.topic.findMany({
        orderBy: {
            display_name: "asc"
        }
    });
    return topics;
}