import { ALLOWED_ORIGIN, APP_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { SignInPayload } from "@/zod/user_schema";
import { ipAddress } from "@vercel/functions";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const authToken = authHeader?.split(" ")[1];
    const userAgent = request.headers.get("User-Agent");

    if (authToken != APP_KEY && userAgent != ALLOWED_ORIGIN) {
      console.error(
        "🚀 ~ POST /api/v1/signin:",
        `${authToken}: ${APP_KEY} -- ${userAgent}: ${ALLOWED_ORIGIN}`,
      );
      return createApiResponse({
        status: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    const formData = await request.json();
    const last_ip = ipAddress(request);
    formData["last_ip"] = last_ip;

    const validatedData = SignInPayload.safeParse(formData);
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.log("🚀 ~ POST /api/v1/signin:", errors.properties);
      return createApiResponse({
        status: false,
        zodError: errors,
      });
    }

    const user_data = validatedData.data;

    const user_device = await prisma.user_device.findFirst({
      where: {
        uuid: user_data.uuid,
      },
    });

    if (user_device?.id_user == null) {
      console.log(
        "🚀 ~ POST /api/v1/signin:",
        `Failed to get anonymous user: ${user_data.uuid}`,
      );
      return createApiResponse({
        status: false,
        message: "Failed to get anonymous user",
        statusCode: 404,
      });
    }
    const id_user = user_device.id_user;

    const update = await prisma.$transaction(async (tx) => {
      return await tx.user.update({
        where: {
          id: id_user,
        },
        data: {
          email: user_data.email,
          name: user_data.name,
          sign_up_type: user_data.sign_up_type,
        },
        select: {
          email: true,
          name: true,
          sign_up_type: true,
        },
      });
    });

    return createApiResponse({
      status: true,
      data: update,
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/signin:", error);
    return createApiResponse({
      status: false,
      message: "Failed to sign user",
      statusCode: 500,
    });
  }
}
