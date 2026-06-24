import { AUDIENCE } from "@/constants/v1/api";
import { getRefreshToken, revokeToken, verifyAppleToken } from "@/data/apple";
import createApiResponse from "@/lib/create_api_response";
import { fcm } from "@/lib/firebase_admin";
import prisma from "@/lib/prisma";
import { ConnectAppleSchema } from "@/zod/connect_email_schema";
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

    const formData = await request.formData();

    const validatedData = ConnectAppleSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );
    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.error("🚀 ~ POST /api/v1/auth/connect:", errors.properties);
      return createApiResponse({
        status: false,
        zodError: errors.properties,
      });
    }

    const user_data = validatedData.data;

    const applePayload = await verifyAppleToken(user_data.identity_token);

    if (!applePayload.status) {
      return createApiResponse({
        status: false,
        statusCode: 403,
        message: `${applePayload.error ?? "Unknown error occured"} (ECA-02)`,
      });
    }
    if (!applePayload.userId) {
      return createApiResponse({
        status: false,
        statusCode: 403,
        message: "Unknown user identifier (ECA-03)",
      });
    }

    const appleToken = await getRefreshToken(user_data.authorization);
    if (!appleToken.status) {
      return createApiResponse({
        status: false,
        message: `${appleToken.error} (ECA-04)`,
        statusCode: 403,
      });
    }

    if (!appleToken.token) {
      return createApiResponse({
        status: false,
        statusCode: 428,
        message: "Unknown Apple Token (ECA-05)",
      });
    }

    const existedUser = await prisma.user.findFirst({
      where: {
        apple_user_id: applePayload.userId!,
      },
      include: {
        user_device: {
          select: {
            fcm_token: true,
          },
        },
      },
    });

    const email = user_data.email ?? existedUser?.email_apple;
    const appleUserId = applePayload.userId ?? existedUser?.apple_user_id;

    if (!email || !appleUserId) {
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
        statusCode: 409,
        message: "Unknown email (ECA-06)",
      });
    }

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
            apple_refresh_token: appleToken.token,
            apple_user_id: applePayload.userId,
            email_apple: email,
            email_google: currentUser?.email_google ?? existedUser.email_google,
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
            email_apple: email,
            apple_refresh_token: appleToken.token,
            apple_user_id: applePayload.userId,
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
      message: "Failed to connect an account",
      statusCode: 500,
    });
  }
}
