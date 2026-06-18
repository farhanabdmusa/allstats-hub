import { AUDIENCE } from "@/constants/v1/api";
import { getRefreshToken, revokeToken, verifyAppleToken } from "@/data/apple";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { AppleSignInPayload } from "@/zod/apple_sign_in_schema";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export async function POST(request: NextRequest): Promise<
  NextResponse<{
    status: boolean;
    data: {
      email: string;
      apple_name: string;
      existed_name?: string;
    };
    message: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zodError: any;
  }>
> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(
      token!,
      new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY),
      { audience: AUDIENCE },
    );
    const { sub, jti, role } = jwt.payload;

    if (!sub || !jti || !role) {
      return createApiResponse({
        status: false,
        message: "User not found",
        statusCode: 404,
      });
    }

    const formData = await request.json();

    const validatedData = AppleSignInPayload.safeParse(formData);
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.error(
        "🚀 ~ POST /api/v1/auth/callback/apple:",
        errors.properties,
      );
      return createApiResponse({
        status: false,
        zodError: errors.properties,
      });
    }

    const user_data = validatedData.data;
    const appleName = [user_data.given_name, user_data.family_name]
      .join(" ")
      .trim();

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
      console.error(
        "🚀 ~ POST /api/v1/auth/callback/apple:",
        `Failed to get user: ${user_data.uuid}`,
      );
      return createApiResponse({
        status: false,
        message: "Failed to get user (EAA-01)",
        statusCode: 404,
      });
    }

    const applePayload = await verifyAppleToken(user_data.identity_token);

    if (!applePayload.status) {
      return createApiResponse({
        status: false,
        statusCode: 403,
        message: `${applePayload.error ?? "Unknown error occured"} (EAA-02)`,
      });
    }
    if (!applePayload.userId) {
      return createApiResponse({
        status: false,
        statusCode: 403,
        message: "Unknown user identifier (EAA-03)",
      });
    }

    const appleToken = await getRefreshToken(user_data.authorization);
    if (!appleToken.status) {
      return createApiResponse({
        status: false,
        message: appleToken.error,
        statusCode: 403,
      });
    }

    // First time user sign in with Apple
    if (user_data.email) {
      const user = await prisma.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          create: {
            email_apple: user_data.email,
            apple_refresh_token: appleToken.token,
            apple_user_id: applePayload.userId,
            name: appleName,
          },
          where: {
            apple_user_id: applePayload.userId,
          },
          update: {
            email_apple: user_data.email,
            apple_refresh_token: appleToken.token,
            apple_user_id: applePayload.userId,
          },
        });

        await tx.user_device.update({
          where: {
            uuid: user_device.uuid,
            os: user_device.os,
            os_version: user_device.os_version,
            fcm_token: user_device.fcm_token,
          },
          data: {
            id_user: user.id,
          },
        });

        return user;
      });
      return createApiResponse({
        status: true,
        data: {
          email: user.email_apple,
          apple_name: appleName,
          existed_name: user.name,
        },
      });
    }

    // Returning user sign in with Apple
    const user = await prisma.user.findFirst({
      where: {
        apple_user_id: applePayload.userId!,
      },
      select: {
        id: true,
        email_apple: true,
        name: true,
      },
    });

    if (user == null) {
      if (appleToken.token) {
        const revoke = await revokeToken(appleToken.token);

        if (!revoke.status && revoke.error != undefined) {
          return createApiResponse({
            status: false,
            statusCode: 401,
            message: revoke.error,
          });
        }
      }

      return createApiResponse({
        status: false,
        statusCode: 404,
        message:
          "Registration couldn't be completed. Please try signing in again. (EAA-404)",
      });
    }

    const newUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        apple_refresh_token: appleToken.token,
        email_apple: applePayload.email,
      },
    });

    return createApiResponse({
      status: true,
      data: {
        email: newUser?.email_apple,
        apple_name: newUser.name,
        existed_name: newUser.name,
      },
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/auth/callback/apple:", error);
    return createApiResponse({
      status: false,
      message: "Failed to sign user",
      statusCode: 500,
    });
  }
}
