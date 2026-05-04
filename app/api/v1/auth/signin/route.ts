import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import createToken, { createRefreshToken } from "@/lib/create_token";
import prisma from "@/lib/prisma";
import { SignInPayload } from "@/zod/user_schema";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import z from "zod";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });
    const { sub, jti, role } = jwt.payload;

    if (!sub || !jti || !role) {
      return createApiResponse({
        status: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    const formData = await request.json();

    const validatedData = SignInPayload.safeParse(formData);
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.log("🚀 ~ POST /api/v1/signin:", errors.properties);
      return createApiResponse({
        status: false,
        zodError: errors.properties,
      });
    }

    const user_data = validatedData.data;

    if (user_data.uuid != jti) {
      return createApiResponse({
        status: false,
        message: "Invalid Token",
        statusCode: 403,
      });
    }

    const user_device = await prisma.user_device.findFirst({
      where: {
        uuid: jti,
      },
    });

    if (user_device == null) {
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

    // Check existing user
    const existing_user = await prisma.user.findUnique({
      where: {
        email_pst: user_data.sign_in_type == 1 ? user_data.email : undefined,
        email_google: user_data.sign_in_type == 2 ? user_data.email : undefined,
        email_apple: user_data.sign_in_type == 3 ? user_data.email : undefined,
      },
      select: {
        id: true,
      },
    });

    const update = await prisma.$transaction(async (tx) => {
      let id_user = existing_user?.id;
      let user: {
        name: string | null;
        id: number;
        email_pst: string | null;
        email_apple: string | null;
        email_google: string | null;
      };
      if (id_user == null) {
        // Create new user
        user = await tx.user.create({
          data: {
            name: user_data.name,
            email_pst:
              user_data.sign_in_type == 1 ? user_data.email : undefined,
            email_google:
              user_data.sign_in_type == 2 ? user_data.email : undefined,
            email_apple:
              user_data.sign_in_type == 3 ? user_data.email : undefined,
          },
        });

        id_user = user.id;
      } else {
        // Update user
        user = await tx.user.update({
          where: {
            id: id_user,
          },
          data: {
            email_pst:
              user_data.sign_in_type == 1 ? user_data.email : undefined,
            email_google:
              user_data.sign_in_type == 2 ? user_data.email : undefined,
            email_apple:
              user_data.sign_in_type == 3 ? user_data.email : undefined,
            name: user_data.name,
          },
        });
      }

      const newToken = await createToken(id_user.toString(), jti, true);
      const newRefreshToken = await createRefreshToken();

      const device = await tx.user_device.update({
        where: {
          uuid: user_data.uuid,
        },
        data: {
          id_user: id_user,
          access_token: newToken,
          refresh_token: newRefreshToken.token,
          refresh_token_expires_at: newRefreshToken.expiresAt,
          sign_in_type: user_data.sign_in_type,
        },
        select: {
          access_token: true,
          refresh_token: true,
        },
      });

      return {
        name: user.name,
        email_pst: user.email_pst,
        email_apple: user.email_apple,
        email_google: user.email_google,
        access_token: device.access_token,
        refresh_token: device.refresh_token,
      };
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
