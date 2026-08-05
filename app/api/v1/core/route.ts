import { AUDIENCE } from "@/constants/v1/api";
import { getAllstatsConfigs } from "@/data/allstats-config";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return createApiResponse({
        status: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }
    const SECRET_KEY = new TextEncoder().encode(
      process.env.SIGNATURE_SECRET_KEY,
    );
    const token = authHeader?.split(" ")[1];
    await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });

    const result = await getAllstatsConfigs({ isPublic: true });

    return createApiResponse({
      status: true,
      data: result,
    });
  } catch (error) {
    console.log("🚀 ~ GET /api/v1/core ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
}
