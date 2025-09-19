"use server"

import prisma from "@/lib/prisma";
import { SortingState } from "@tanstack/react-table";

export async function countAllUser() {
    const count = await prisma.user.count();
    return count;
}

export async function getAllUser(pageSize?: number, page?: number, sort?: SortingState) {
    const flatSort = sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            sign_up_type_relation: {
                select: {
                    name: true,
                }
            },
            user_device: {
                select: {
                    uuid: true,
                    last_session: true,
                }
            }
        },
        orderBy: flatSort,
        take: pageSize,
        skip: page && pageSize ? page * pageSize : undefined,
    });

    return users.map(user => ({
        id: user.id,
        email: user.email,
        sign_up_type: user.sign_up_type_relation?.name,
        user_device: user.user_device,
    }));
}