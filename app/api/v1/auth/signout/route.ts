import { AUDIENCE } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import createToken, { createRefreshToken } from "@/lib/create_token";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

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

    const userDevice = await prisma.user_device.findFirst({
      where: {
        id_user: idUser,
        uuid: jti,
      },
    });

    if (userDevice == null) {
      return createApiResponse({
        status: false,
        message: "User Not Found",
        statusCode: 404,
      });
    }

    const newAccessToken = await createToken(jti, jti);
    const refreshToken = await createRefreshToken();

    await prisma.user_device.update({
      where: {
        uuid: jti,
        id_user: idUser,
      },
      data: {
        sign_in_type: null,
        last_session: new Date(),
        access_token: newAccessToken,
        refresh_token: refreshToken.token,
        refresh_token_expires_at: refreshToken.expiresAt,
      },
    });

    return createApiResponse({
      status: true,
      data: {
        access_token: token,
        refresh_token: refreshToken.token,
      },
    });
  } catch (e) {
    console.log("🚀 ~ POST /api/v1/auth/signout:", e);
    return createApiResponse({
      status: false,
      message: "Failed to connect an account",
      statusCode: 500,
    });
  }
}
