"use server";

import prisma from "@/lib/prisma";
import { User, UserDevice } from "@/types/user";
import { SortingState } from "@tanstack/react-table";

export async function countAllUser() {
  const count = await prisma.user.count();
  return count;
}

export async function getAllUser(
  pageSize?: number,
  page?: number,
  sort?: SortingState,
): Promise<User[]> {
  const flatSort = sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email_pst: true,
      email_apple: true,
      email_google: true,
      user_device: {
        select: {
          uuid: true,
          last_session: true,
          sign_up_type: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: flatSort,
    take: pageSize,
    skip: page && pageSize ? page * pageSize : undefined,
  });

  return users.map((user) => ({
    id: user.id,
    email_pst: user.email_pst,
    email_google: user.email_google,
    email_apple: user.email_apple,
    user_device: user.user_device.map(
      (device): UserDevice => ({
        last_session: device.last_session,
        sign_in_type: device.sign_up_type?.name,
        uuid: device.uuid,
      }),
    ),
  }));
}
