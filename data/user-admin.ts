"use server";

import { getCurrentDateTime } from "@/lib/jakarta_datetime";
import prisma from "@/lib/prisma";
import { UserAdmin } from "@/types/user-admin";
import { SortingState } from "@tanstack/react-table";
import { getServerSession } from "next-auth";

const countAllAdminUsers = async () => {
  return await prisma.user_admin.count();
};

const getAdminUsers = async (
  pageSize?: number,
  page?: number,
  sort?: SortingState,
) => {
  const flatSort = sort?.map((s) => ({ [s.id]: s.desc ? "desc" : "asc" }));
  const users = await prisma.user_admin.findMany({
    select: {
      id: true,
      uuid: true,
      email: true,
      name: true,
      is_admin: true,
      admin_updated_by: true,
      admin_updated_at: true,
      last_signin_at: true,
      created_at: true,
    },
    orderBy: flatSort,
    take: pageSize,
    skip: page && pageSize ? page * pageSize : undefined,
  });

  return users;
};

const getAdminUser = async (
  uuid: string,
): Promise<{
  status: boolean;
  message?: string;
  data?: UserAdmin;
}> => {
  try {
    const user = await prisma.user_admin.findFirst({
      where: {
        uuid: uuid,
      },
      select: {
        id: true,
        uuid: true,
        email: true,
        name: true,
        is_admin: true,
        admin_updated_by: true,
        admin_updated_at: true,
        last_signin_at: true,
        created_at: true,
      },
    });
    if (!user) {
      return {
        status: false,
        message: "User not found",
      };
    }
    return {
      status: true,
      data: user,
    };
  } catch (e) {
    return {
      status: false,
      message: `${e}`,
    };
  }
};

const updateAdminUser = async (uuid: string, is_admin: boolean) => {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return {
        status: false,
        message: "Unauthorized User",
      };
    }

    const user = session.user;
    if (!user.email) {
      return {
        status: false,
        message: "Unknown user",
      };
    }

    await prisma.user_admin.update({
      where: {
        uuid: uuid,
      },
      data: {
        is_admin: is_admin,
        admin_updated_at: getCurrentDateTime(),
        admin_updated_by: user.email,
      },
    });

    return { status: true };
  } catch (e) {
    return {
      status: false,
      message: `${e ?? "Unknown Error"}`,
    };
  }
};

export { countAllAdminUsers, getAdminUsers, getAdminUser, updateAdminUser };
