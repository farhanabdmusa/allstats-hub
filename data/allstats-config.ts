"use server";

import prisma from "@/lib/prisma";
import { normalizePrismaErrorMessage } from "@/lib/prisma_error";
import { AllstatsConfig } from "@/types/allstats-config";
import { SortingState } from "@tanstack/react-table";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

const normalizeSort = (sort?: SortingState) => {
  const normalizedSort = [...(sort ?? [])]
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.id))
    .sort(
      (a, b) => a.id.localeCompare(b.id) || Number(a.desc) - Number(b.desc),
    );

  return normalizedSort;
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
    return {
      status: false,
      message: normalizePrismaErrorMessage(error),
    };
  }
};

const getAllstatsConfigs = async (
  pageSize?: number,
  page?: number,
  sort?: SortingState,
): Promise<{
  status: boolean;
  data?: AllstatsConfig[];
  message?: string;
}> => {
  try {
    const normalizedSort = normalizeSort(sort);
    const flatSort = normalizedSort.map((s) => ({
      [s.id]: s.desc ? "desc" : "asc",
    }));

    const result = await prisma.allstats_config.findMany({
      orderBy: flatSort,
      take: pageSize,
      skip: page && pageSize ? page * pageSize : undefined,
    });
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

    revalidateTag("allstats-config", "max");
    revalidateTag("allstats-config-count", "max");

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

    revalidateTag("allstats-config", "max");
    revalidateTag("allstats-config-count", "max");

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

export {
  getAllstatsConfigs,
  countAllstatsConfig,
  createAllstatsConfig,
  updateAllstatsConfig,
};
