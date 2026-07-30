import { AUDIENCE } from "@/constants/v1/api";
import { getRefreshToken, revokeToken, verifyAppleToken } from "@/data/apple";
import createApiResponse from "@/lib/create_api_response";
import createToken, { createRefreshToken } from "@/lib/create_token";
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

    if (!sub || !jti || !role || role != "guest") {
      return createApiResponse({
        status: false,
        message: "Invalid Token",
        statusCode: 401,
      });
    }

    const formData = await request.json();

    const validatedData = AppleSignInPayload.safeParse(formData);
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.error(
        "🚀 ~ POST /api/v1/auth/signin/callbacks/apple:",
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
        "🚀 ~ POST /api/v1/auth/signin/callbacks/apple:",
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

    // Returning user validation
    if (!user_data.email) {
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
        // Revoke sign in with Apple and ask the user to sign in again
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
    }

    // First time user sign in with Apple
    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        create: {
          email_apple: user_data.email,
          apple_refresh_token: appleToken.token,
          apple_user_id: applePayload.userId,
          name: appleName,
          user_preference: {
            create: {
              lang: user_data.user_preference.lang,
              domain: user_data.user_preference.mfd,
              topic_selection: user_data.user_preference.topic_selection,
            },
          },
          user_topic: {
            createMany: {
              data:
                user_data.user_preference.subscribed_topic?.map((e) => ({
                  id_topic: e.id,
                  subscribed_at: e.timestamp,
                })) ?? [],
              skipDuplicates: true,
            },
          },
          user_like_product: {
            createMany: {
              skipDuplicates: true,
              data:
                user_data.user_favorites?.map((e) => ({
                  mfd: e.mfd,
                  product_id: e.product_id,
                  product_type: e.product_type,
                  timestamp: e.timestamp,
                })) ?? [],
            },
          },
        },
        where: {
          apple_user_id: applePayload.userId,
        },
        update: {
          apple_refresh_token: appleToken.token,
          apple_user_id: applePayload.userId,
          user_preference: {
            upsert: {
              create: {
                lang: user_data.user_preference.lang,
                domain: user_data.user_preference.mfd,
                topic_selection: user_data.user_preference.topic_selection,
              },
              update: {
                lang: user_data.user_preference.lang,
                domain: user_data.user_preference.mfd,
                topic_selection: user_data.user_preference.topic_selection,
              },
            },
          },
          user_like_product: {
            createMany: {
              skipDuplicates: true,
              data:
                user_data.user_favorites?.map((e) => ({
                  mfd: e.mfd,
                  product_id: e.product_id,
                  product_type: e.product_type,
                  timestamp: e.timestamp,
                })) ?? [],
            },
          },
          user_topic: {
            createMany: {
              skipDuplicates: true,
              data:
                user_data.user_preference.subscribed_topic?.map((e) => ({
                  id_topic: e.id,
                  subscribed_at: e.timestamp,
                })) ?? [],
            },
          },
        },
      });

      const newToken = await createToken(user.id.toString(), jti, true);
      const newRefreshToken = await createRefreshToken();

      const device = await tx.user_device.update({
        where: {
          uuid: user_data.uuid,
        },
        data: {
          id_user: user.id,
          access_token: newToken,
          refresh_token: newRefreshToken.token,
          refresh_token_expires_at: newRefreshToken.expiresAt,
          sign_in_type: 3,
        },
        select: {
          access_token: true,
          refresh_token: true,
        },
      });

      const liked_products = await tx.user_like_product.findMany({
        where: {
          user_id: user.id,
        },
        select: {
          mfd: true,
          product_id: true,
          product_type: true,
          timestamp: true,
        },
      });

      return {
        name: user.name,
        email_pst: user.email_pst,
        email_apple: user.email_apple,
        email_google: user.email_google,
        access_token: device.access_token,
        refresh_token: device.refresh_token,
        liked_products: liked_products,
      };
    });
    return createApiResponse({
      status: true,
      data: { ...user, apple_name: user_data.email ? appleName : undefined },
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/auth/signin/callbacks/apple:", error);
    return createApiResponse({
      status: false,
      message: "Failed to sign user",
      statusCode: 500,
    });
  }
}
