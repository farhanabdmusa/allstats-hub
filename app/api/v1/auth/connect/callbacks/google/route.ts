import { AUDIENCE } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import { fcm } from "@/lib/firebase_admin";
import prisma from "@/lib/prisma";
import { ConnectGoogleSchema } from "@/zod/connect_email_schema";
import { OAuth2Client } from "google-auth-library";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import z from "zod";

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
        message: "Invalid Token (EGC-01)",
        statusCode: 428,
      });
    }

    if (role != "user") {
      return createApiResponse({
        status: false,
        message: "Unauthorized User (EGC-02)",
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
        message: "User Not Found (EGC-03)",
        statusCode: 404,
      });
    }

    const formData = await request.formData();

    const validatedData = ConnectGoogleSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.error(
        "🚀 ~ POST /api/v1/auth/connect/callbacks/google:",
        errors.properties,
      );
      return createApiResponse({
        status: false,
        zodError: errors.properties,
      });
    }

    const user_data = validatedData.data;

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: user_data.id_token,
      audience: process.env.FIREBASE_GCLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return createApiResponse({
        status: false,
        message: "Invalid token payload (EGC-04)",
        statusCode: 401,
      });
    }

    const existedUser = await prisma.user.findFirst({
      where: {
        email_google: payload.email,
      },
      include: {
        user_device: {
          select: {
            fcm_token: true,
          },
        },
      },
    });

    const email = payload.email;

    const updatedUser: {
      user: {
        email_pst: string | null;
        email_apple: string | null;
        email_google: string | null;
      };
      deletedTopic: string[];
    } = await prisma.$transaction(async (tx) => {
      if (existedUser && existedUser.id != idUser) {
        // Merge User
        // Step 1: Delete existed user preference
        await tx.user_preference.delete({
          where: {
            id_user: existedUser.id,
          },
        });

        // Step 2: Delete user topic
        const existedUserTopic = await tx.user_topic.findMany({
          where: {
            id_user: existedUser.id,
          },
          include: {
            topic: {
              select: {
                name: true,
              },
            },
          },
        });

        await tx.user_topic.deleteMany({
          where: {
            id_user: existedUser.id,
          },
        });

        // Step 3: Move liked products to new user
        const userLikedProducts = await tx.user_like_product.findMany({
          where: {
            user_id: existedUser.id,
          },
        });

        if (userLikedProducts.length > 0) {
          const newData = userLikedProducts.map((e) => ({
            mfd: e.mfd,
            product_id: e.product_id,
            product_type: e.product_type,
            user_id: idUser,
            timestamp: e.timestamp,
          }));

          await tx.user_like_product.createMany({
            data: newData,
            skipDuplicates: true,
          });

          await tx.user_like_product.deleteMany({
            where: {
              user_id: existedUser.id,
            },
          });
        }

        // Step 4: User Device
        await tx.user_device.deleteMany({
          where: {
            id_user: existedUser.id,
          },
        });

        // Step 5: Delete user
        await tx.user.delete({
          where: {
            id: existedUser.id,
          },
        });

        // Step 6: Unsubscribe topic
        const tokens = existedUser.user_device
          .filter((e) => e.fcm_token != null)
          .map((e) => e.fcm_token!);
        if (tokens.length > 0 && existedUserTopic.length > 0 && existedUser) {
          const unsubscribeRequest = existedUserTopic.map((topic) =>
            fcm.unsubscribeFromTopic(tokens, topic.topic.name),
          );
          const unsubs = await Promise.all(unsubscribeRequest);
          const totalError = unsubs
            .map((e) => e.failureCount)
            .reduce((prev, value) => prev + value, 0);
          if (totalError > 0) {
            throw new Error(
              `Error occured while unsubscribing the topic: ${totalError} Errors`,
              {
                cause: "Firebase",
              },
            );
          }
        }

        // Final Step: Update user data
        const currentUser = await tx.user.findFirst({
          where: {
            id: idUser,
          },
        });
        const newUser = await tx.user.update({
          where: {
            id: idUser,
          },
          data: {
            apple_refresh_token:
              currentUser?.apple_refresh_token ??
              existedUser.apple_refresh_token,
            apple_user_id:
              currentUser?.apple_user_id ?? existedUser.apple_user_id,
            email_apple: currentUser?.email_apple ?? existedUser.email_apple,
            email_google: email,
            email_pst: currentUser?.email_pst ?? existedUser.email_pst,
          },
          select: {
            email_apple: true,
            email_google: true,
            email_pst: true,
          },
        });

        return {
          user: newUser,
          deletedTopic: existedUserTopic.map((e) => e.topic.name),
        };
      } else {
        const user = await tx.user.update({
          where: {
            id: idUser,
          },
          data: {
            email_google: email,
          },
          select: {
            email_apple: true,
            email_google: true,
            email_pst: true,
          },
        });

        return { user: user, deletedTopic: [] };
      }
    });

    return createApiResponse({
      status: true,
      data: updatedUser.user,
    });
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/auth/connect:", error);
    return createApiResponse({
      status: false,
      message: "Failed to connect an account (EGC-500)",
      statusCode: 500,
    });
  }
}
