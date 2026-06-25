import { AUDIENCE } from "@/constants/v1/api";
import { revokeToken } from "@/data/apple";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { DisconnectEmailSchema } from "@/zod/connect_email_schema";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { treeifyError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const SECRET_KEY = new TextEncoder().encode(
      process.env.SIGNATURE_SECRET_KEY,
    );
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });
    const { sub, jti, role } = jwt.payload;

    if (!sub || !jti || !role) {
      return createApiResponse({
        status: false,
        message: "Invalid Token",
        statusCode: 428,
      });
    }

    if (role != "user") {
      return createApiResponse({
        status: false,
        message: "Unauthorized User",
        statusCode: 401,
      });
    }

    const idUser = parseInt(sub);

    const user = await prisma.user.findFirst({
      where: {
        id: idUser,
      },
    });

    if (user == null) {
      return createApiResponse({
        status: false,
        message: "User Not Found",
        statusCode: 404,
      });
    }

    const device = await prisma.user_device.findFirst({
      where: {
        uuid: jti,
        id_user: idUser,
      },
    });

    if (!device || !device.sign_in_type) {
      return createApiResponse({
        status: false,
        statusCode: 404,
        message: "Unknown device",
      });
    }

    const formData = await request.formData();

    const validatedData = DisconnectEmailSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );
    if (!validatedData.success) {
      const errors = treeifyError(validatedData.error);
      console.error("🚀 ~ POST /api/v1/auth/disconnect:", errors.properties);
      return createApiResponse({
        status: false,
        zodError: errors.properties,
      });
    }

    const type = validatedData.data.type;

    if (type == device.sign_in_type) {
      // Main account on device
      return createApiResponse({
        status: false,
        statusCode: 403,
        message: "Unable unlink main account on this device",
      });
    }

    if (type == 3) {
      // Revoke Apple Token
      if (user.apple_refresh_token) {
        const revoke = await revokeToken(user.apple_refresh_token);

        if (!revoke.status && revoke.error != undefined) {
          return createApiResponse({
            status: false,
            statusCode: 401,
            message: revoke.error,
          });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: idUser,
      },
      data: {
        email_pst: type == 1 ? null : undefined,
        email_google: type == 2 ? null : undefined,
        email_apple: type == 3 ? null : undefined,
        apple_refresh_token: type == 3 ? null : undefined,
        apple_user_id: type == 3 ? null : undefined,
      },
      select: {
        email_apple: true,
        email_google: true,
        email_pst: true,
      },
    });

    return createApiResponse({
      status: true,
      data: updatedUser,
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/auth/disconnect:", error);
    return createApiResponse({
      status: false,
      message: "Failed to connect an account",
      statusCode: 500,
    });
  }
}
