import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { GetLikeSchemaBatch } from "@/zod/get_like_schema";
import { Prisma } from "@prisma/client";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import z from "zod";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, {
      audience: AUDIENCE,
    });

    const searchParams = request.nextUrl.searchParams;
    const product_id = searchParams.getAll("product_id[]");
    const mfd = searchParams.get("mfd");
    const product_type = searchParams.get("product_type")
      ? Number(searchParams.get("product_type"))
      : undefined;

    const validatedData = GetLikeSchemaBatch.safeParse({
      product_id,
      product_type,
      mfd,
    });

    if (!validatedData.success) {
      return createApiResponse({
        status: false,
        statusCode: 422,
        zodError: z.treeifyError(validatedData.error),
      });
    }

    const result = await prisma.$queryRaw<
      Array<{
        mfd: string;
        product_type: number;
        product_id: string;
        total: number;
        timestamp: Date;
      }>
    >`select
	lc.mfd,
	lc.product_type,
	lc.product_id,
	lc.total,
	ulp."timestamp"
from
	like_counter lc
left join user_like_product ulp on
	lc.mfd = ulp.mfd
	and lc.product_id = ulp.product_id
	and lc.product_type = ulp.product_type
	and ulp.user_id = ${Number(jwt.payload.sub)}
where
	lc.mfd = ${validatedData.data.mfd}
	and lc.product_type = ${validatedData.data.product_type}
	and lc.product_id in (${Prisma.join(validatedData.data.product_id)})`;

    return createApiResponse({
      status: true,
      data: result,
    });
  } catch (error) {
    console.log("🚀 ~ GET /api/v1/like ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
}
