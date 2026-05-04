import { ALLOWED_ORIGIN, APP_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import createToken, { createRefreshToken } from "@/lib/create_token";
import prisma from "@/lib/prisma";
import UserSchema from "@/zod/user_schema";
import { ipAddress } from "@vercel/functions";
import type { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const authToken = authHeader?.split(" ")[1];
    const userAgent = request.headers.get("User-Agent");

    if (authToken != APP_KEY && userAgent != ALLOWED_ORIGIN) {
      return createApiResponse({
        status: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    const formData = await request.json();
    const last_ip = ipAddress(request);
    formData["last_ip"] = last_ip;

    const validatedData = UserSchema.safeParse(formData);

    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.log("🚀 ~ POST /api/v1/token:", errors.properties);
      return createApiResponse({
        status: false,
        zodError: errors,
      });
    }

    const token = await createToken(
      validatedData.data.uuid,
      validatedData.data.uuid,
    );
    const refreshToken = await createRefreshToken();

    const update = await prisma.$transaction(async (tx) => {
      await tx.user_device.upsert({
        where: {
          uuid: validatedData.data.uuid,
        },
        create: {
          uuid: validatedData.data.uuid,
          manufacturer: validatedData.data.manufacturer,
          device_model: validatedData.data.device_model,
          os: validatedData.data.os,
          first_session: validatedData.data.first_session ?? undefined,
          fcm_token: validatedData.data.fcm_token,
          is_virtual: validatedData.data.is_virtual,
          last_ip: validatedData.data.last_ip,
          os_version: validatedData.data.os_version,
          new_version: validatedData.data.new_version ?? undefined,
          last_session: validatedData.data.last_session ?? undefined,
          access_token: token,
          refresh_token: refreshToken.token,
          refresh_token_expires_at: refreshToken.expiresAt,
          sign_in_type: null,
        },
        update: {
          manufacturer: validatedData.data.manufacturer,
          device_model: validatedData.data.device_model,
          os: validatedData.data.os,
          first_session: validatedData.data.first_session ?? undefined,
          fcm_token: validatedData.data.fcm_token,
          is_virtual: validatedData.data.is_virtual,
          last_ip: validatedData.data.last_ip,
          os_version: validatedData.data.os_version,
          new_version: validatedData.data.new_version ?? undefined,
          last_session: validatedData.data.last_session ?? undefined,
          access_token: token,
          refresh_token: refreshToken.token,
          refresh_token_expires_at: refreshToken.expiresAt,
          sign_in_type: null,
        },
      });
      return {
        access_token: token,
        refresh_token: refreshToken.token,
      };
    });

    return createApiResponse({
      status: true,
      data: update,
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/token:", error);
    return createApiResponse({
      status: false,
      message: "Failed to insert user",
      statusCode: 500,
    });
  }
}
