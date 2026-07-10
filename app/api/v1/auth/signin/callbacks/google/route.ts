import { AUDIENCE } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import { GoogleSignInPayload } from "@/zod/google_sign_in_schema";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import z from "zod";
import { OAuth2Client } from "google-auth-library";
import prisma from "@/lib/prisma";
import createToken, { createRefreshToken } from "@/lib/create_token";

export async function POST(request: NextRequest) {
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
        message: "Invalid Token (EGA-01)",
        statusCode: 401,
      });
    }

    const formData = await request.json();

    const validatedData = GoogleSignInPayload.safeParse(formData);
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.error(
        "🚀 ~ POST /api/v1/auth/signin/callbacks/google:",
        errors.properties,
      );
      return createApiResponse({
        status: false,
        zodError: errors.properties,
      });
    }

    const user_data = validatedData.data;

    if (user_data.uuid != jti) {
      return createApiResponse({
        status: false,
        message: "Invalid Token (EGA-02)",
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
        "🚀 ~ POST /api/v1/auth/signin/callbacks/google:",
        `Failed to get user: ${user_data.uuid}`,
      );
      return createApiResponse({
        status: false,
        message: "Failed to get user (EGA-03)",
        statusCode: 404,
      });
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: user_data.id_token,
      audience: process.env.FIREBASE_GCLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return createApiResponse({
        status: false,
        message: "Invalid token payload (EGA-04)",
        statusCode: 401,
      });
    }

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        create: {
          email_google: payload.email,
          name: payload.name,
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
          email_google: payload.email,
        },
        update: {
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
          sign_in_type: 2,
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
      data: user,
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/auth/signin/callbacks/google:", error);
    return createApiResponse({
      status: false,
      message: "Failed to sign user (EGA-500)",
      statusCode: 500,
    });
  }
}
