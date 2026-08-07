"use server";

import prisma from "@/lib/prisma";
import { normalizePrismaErrorMessage } from "@/lib/prisma_error";
import { AllstatsConfig } from "@/types/allstats-config";
import { getServerSession } from "next-auth";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

const normalizeSort = (
  sort?: string | string[],
):
  | undefined
  | {
      [x: string]: string;
    }[] => {
  if (sort == undefined) {
    return undefined;
  }
  if (typeof sort == "string") {
    const splitted = sort.split(":");
    return [{ [splitted[0].trim()]: splitted[1].trim() }];
  }

  return sort.map((i) => {
    const splitted = i.split(":");
    return { [splitted[0].trim()]: splitted[1].trim() };
  });
};

const countAllstatsConfig = async (): Promise<{
  status: boolean;
  count?: number;
  message?: string;
}> => {
  try {
    const count = await prisma.allstats_config.count();
    return {
      status: true,
      count,
    };
  } catch (error) {
    console.log("🚀 ~ countAllstatsConfig ~ error:", error);
    return {
      status: false,
      message: normalizePrismaErrorMessage(error),
    };
  }
};

const getAllstatsConfigs = async ({
  pageSize,
  page,
  sort,
  isPublic = false,
}: {
  pageSize?: number;
  page?: number;
  sort?: string | string[];
  isPublic?: boolean;
}): Promise<{
  status: boolean;
  data?: AllstatsConfig[];
  message?: string;
  total?: number;
}> => {
  "use cache";

  try {
    cacheTag("allstats_config");
    cacheLife("hours");
    const flatSort = normalizeSort(sort);
    const countResult = await countAllstatsConfig();

    if (!countResult.status) {
      throw new Error(countResult.message ?? "Unknown Error");
    }

    const result = await prisma.allstats_config.findMany({
      select: isPublic ? { name: true, value: true } : undefined,
      orderBy: flatSort,
      take: pageSize,
      skip: page && pageSize ? page * pageSize : undefined,
    });
    return {
      status: true,
      data: result,
      total: countResult.count ?? 0,
    };
  } catch (error) {
    console.log("🚀 ~ getAllstatsConfigs ~ error:", error);
    return {
      status: false,
      message: normalizePrismaErrorMessage(error),
    };
  }
};

const createAllstatsConfig = async ({
  name,
  value,
}: {
  name: string;
  value: string;
}) => {
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
    const result = await prisma.allstats_config.create({
      data: {
        name,
        value,
        created_at: new Date(),
        created_by: user.email,
        updated_at: new Date(),
        updated_by: user.email,
      },
      select: {
        name: true,
      },
    });

    revalidateTag("allstats_config", "hours");

    return {
      status: true,
      data: result,
    };
  } catch (error) {
    return {
      status: false,
      message: normalizePrismaErrorMessage(error),
    };
  }
};

const updateAllstatsConfig = async ({
  id,
  name,
  value,
}: {
  id: number;
  name: string;
  value: string;
}) => {
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
    const result = await prisma.allstats_config.update({
      where: {
        id: id,
      },
      data: {
        name,
        value,
        updated_at: new Date(),
        updated_by: user.email,
      },
      select: {
        name: true,
      },
    });

    revalidateTag("allstats_config", "hours");

    return {
      status: true,
      data: result,
    };
  } catch (error) {
    return {
      status: false,
      message: normalizePrismaErrorMessage(error),
    };
  }
};

const deleteAllstatsConfig = async (id: number) => {
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
    await prisma.allstats_config.delete({
      where: {
        id: id,
      },
    });

    revalidateTag("allstats_config", "hours");

    return {
      status: true,
    };
  } catch (error) {
    return {
      status: false,
      message: normalizePrismaErrorMessage(error),
    };
  }
};

export {
  getAllstatsConfigs,
  createAllstatsConfig,
  updateAllstatsConfig,
  deleteAllstatsConfig,
};
