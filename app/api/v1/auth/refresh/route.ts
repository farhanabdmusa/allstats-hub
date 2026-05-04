import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import createApiResponse from "@/lib/create_api_response";
import createToken from "@/lib/create_token";
import { decodeJwt } from "jose";

/**
 * Handles the POST request for refreshing authentication tokens.
 *
 * This endpoint expects a JSON body containing a `refresh_token`. It validates the provided refresh token,
 * checks its existence and expiry in the database, and if valid, issues a new access token and a new refresh token
 * (token rotation). The new tokens are updated in the database and returned in the response.
 *
 * @param request - The incoming Next.js request object containing the refresh token in the body.
 * @returns A JSON response indicating success or failure, along with new tokens if successful.
 *
 * @throws Returns a 400 response if the refresh token is missing.
 * @throws Returns a 401 response if the refresh token is invalid or expired.
 * @throws Returns a 500 response if an internal server error occurs.
 */
export async function POST(request: NextRequest) {
  try {
    const { refresh_token, uuid } = await request.json();

    if (!refresh_token) {
      return createApiResponse({
        status: false,
        message: "Refresh token required",
        statusCode: 400,
      });
    }

    const userDevice = await prisma.user_device.findFirst({
      where: { refresh_token, uuid },
      select: {
        id_user: true,
        uuid: true,
        refresh_token_expires_at: true,
        access_token: true,
      },
    });

    if (!userDevice || !userDevice.access_token) {
      return createApiResponse({
        status: false,
        message: "Invalid refresh token",
        statusCode: 401,
      });
    }
    const jwt = decodeJwt(userDevice.access_token);
    const role = jwt["role"] == "user";
    const sub = jwt["sub"];
    const jti = jwt["jti"];
    if (!sub || !jti || uuid != jti) {
      return createApiResponse({
        status: false,
        message: "Invalid refresh token",
        statusCode: 401,
      });
    }

    if (
      userDevice.refresh_token_expires_at &&
      userDevice.refresh_token_expires_at < new Date()
    ) {
      return createApiResponse({
        status: false,
        message: "Refresh token expired",
        statusCode: 401,
      });
    }

    // Buat access token baru
    const newAccessToken = await createToken(sub, jti, role);
    // Buat refresh token baru (token rotation)
    const newRefreshToken = crypto.randomUUID();
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 30); // Set expiry 30 hari ke depan

    // Update refresh token di database
    await prisma.user_device.update({
      where: {
        uuid: userDevice.uuid,
      },
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        refresh_token_expires_at: tokenExpiry,
      },
    });

    return createApiResponse({
      status: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal server error",
      statusCode: 500,
    });
  }
}
