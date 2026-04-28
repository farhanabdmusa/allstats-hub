import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
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

    const userId = Number(jwt.payload.sub!);

    if (Number.isNaN(userId)) {
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
          email_pst: user_data.sign_in_type == 1 ? user_data.email : undefined,
          email_google:
            user_data.sign_in_type == 2 ? user_data.email : undefined,
          email_apple:
            user_data.sign_in_type == 3 ? user_data.email : undefined,
          name: user_data.name,
          user_device: {
            update: {
              where: {
                id_user_uuid: {
                  id_user: id_user,
                  uuid: user_data.uuid,
                },
              },
              data: {
                sign_in_type: user_data.sign_in_type,
              },
            },
          },
        },
        select: {
          email_pst: true,
          email_google: true,
          email_apple: true,
          name: true,
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
