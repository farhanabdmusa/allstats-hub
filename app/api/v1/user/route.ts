import { type NextRequest } from "next/server";
import { ipAddress } from "@vercel/functions";
import prisma from "@/lib/prisma";
import createApiResponse from "@/lib/create_api_response";
import z from "zod";
import { jwtVerify } from "jose";
import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import { UpdateUserPayload } from "@/zod/user_schema";
import createToken, { createRefreshToken } from "@/lib/create_token";

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
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });
    const { sub, jti, role } = jwt.payload;
    if (!sub || !jti || !role) {
      return createApiResponse({
        status: false,
        message: "Invalid Token",
        statusCode: 403,
      });
    }
    const userId = Number(sub);
    const uuid = jti;

    if (role != "user") {
      return createApiResponse({
        status: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    if (Number.isNaN(userId)) {
      return createApiResponse({
        status: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    const user = await prisma.user.findUnique({
      omit: {
        id: true,
      },
      where: {
        id: userId,
      },
      include: {
        user_preference: {
          select: {
            domain: true,
            lang: true,
          },
        },
      },
    });
    if (!user) {
      return createApiResponse({
        status: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    const newToken = await createToken(userId.toString(), uuid, true);
    const refreshToken = await createRefreshToken();

    const updatedUser = await prisma.user.update({
      data: {
        user_device: {
          update: {
            where: {
              uuid,
            },
            data: {
              access_token: newToken,
              refresh_token: refreshToken.token,
              refresh_token_expires_at: refreshToken.expiresAt,
            },
          },
        },
      },
      where: {
        id: userId,
        user_device: {
          some: {
            uuid: uuid,
          },
        },
      },
      include: {
        user_preference: {
          select: {
            domain: true,
            lang: true,
            topic_selection: true,
          },
        },
      },
    });

    const data = {
      email_apple: updatedUser.email_apple,
      email_pst: updatedUser.email_pst,
      email_google: updatedUser.email_google,
      name: updatedUser.name,
      domain: updatedUser.user_preference?.domain,
      lang: updatedUser.user_preference?.lang,
      topic_selection: updatedUser.user_preference?.topic_selection,
      access_token: newToken,
      refresh_token: refreshToken.token,
    };

    return createApiResponse({
      status: true,
      data: data,
    });
  } catch (error) {
    console.log("🚀 ~ GET /api/v1/user ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });
    const { sub, jti, role } = jwt.payload;
    if (!sub || !jti || !role) {
      return createApiResponse({
        status: false,
        message: "Invalid Token",
        statusCode: 403,
      });
    }
    const userId = Number(sub);
    const uuid = jti;

    if (role != "user") {
      return createApiResponse({
        status: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }

    if (Number.isNaN(userId)) {
      return createApiResponse({
        status: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    const check = await prisma.user_device.findUnique({
      select: {
        id_user: true,
      },
      where: {
        uuid: uuid,
        id_user: userId,
      },
    });
    if (!check) {
      console.log("🚀 ~ PUT ~ check:", check);
      await prisma.user_device.update({
        where: {
          uuid,
        },
        data: {
          access_token: null,
          refresh_token: null,
          sign_in_type: null,
        },
      });
      return createApiResponse({
        status: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    const accessToken = await createToken(userId.toString(), uuid);
    const refreshToken = await createRefreshToken();

    const formData = await request.json();
    const last_ip = ipAddress(request);

    const validatedData = UpdateUserPayload.safeParse({
      ...formData,
      user_id: userId,
      last_ip: last_ip,
    });

    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.log("🚀 ~ PUT ~ errors:", errors);
      return createApiResponse({
        status: false,
        zodError: errors,
      });
    }

    await prisma.user.update({
      omit: {
        id: true,
      },
      where: {
        id: userId,
      },
      data: {
        user_device: {
          upsert: {
            where: {
              uuid: uuid,
              id_user: userId,
            },
            create: {
              uuid: uuid,
              manufacturer: validatedData.data.manufacturer ?? undefined,
              device_model: validatedData.data.device_model ?? undefined,
              os: validatedData.data.os ?? undefined,
              os_version: validatedData.data.os_version ?? undefined,
              is_virtual: validatedData.data.is_virtual ?? undefined,
              last_ip: validatedData.data.last_ip ?? undefined,
              new_version: validatedData.data.new_version ?? undefined,
              fcm_token: validatedData.data.fcm_token ?? undefined,
              access_token: accessToken,
              refresh_token: refreshToken.token,
              refresh_token_expires_at: refreshToken.expiresAt,
            },
            update: {
              manufacturer: validatedData.data.manufacturer ?? undefined,
              device_model: validatedData.data.device_model ?? undefined,
              os: validatedData.data.os ?? undefined,
              os_version: validatedData.data.os_version ?? undefined,
              is_virtual: validatedData.data.is_virtual ?? undefined,
              last_ip: validatedData.data.last_ip ?? undefined,
              new_version: validatedData.data.new_version ?? undefined,
              fcm_token: validatedData.data.fcm_token ?? undefined,
              access_token: accessToken,
              refresh_token: refreshToken.token,
              refresh_token_expires_at: refreshToken.expiresAt,
            },
          },
        },
        name: validatedData.data.name ?? undefined,
        user_preference: {
          update: {
            lang: validatedData.data.lang ?? undefined,
            domain: validatedData.data.domain ?? undefined,
            topic_selection: validatedData.data.topic_selection ?? undefined,
          },
        },
      },
    });

    const data = {
      ...validatedData.data,
      access_token: accessToken,
      refresh_token: refreshToken.token,
    };

    return createApiResponse({
      status: true,
      data: data,
    });
  } catch (error) {
    console.log("🚀 ~ PUT /api/v1/user ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
}
