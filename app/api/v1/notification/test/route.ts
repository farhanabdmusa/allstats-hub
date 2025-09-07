import createApiResponse from "@/lib/create_api_response";
import { fcm } from "@/lib/firebase_admin";
import prisma from "@/lib/prisma";
import { MulticastMessage } from "firebase-admin/messaging"

export async function GET() {
  try {
    const listTokens = await prisma.user.findMany({
      select: {
        fcm_token: true
      },
      where: {
        fcm_token: {
          not: null
        }
      }
    })
    console.log("🚀 ~ GET ~ listTokens:", listTokens.map(user => user.fcm_token))

    const message: MulticastMessage = {
      tokens: listTokens.map(user => user.fcm_token) as string[],
      notification: {
        title: "📢📢📢 Update Aplikasi Tersedia!",
        body: "Versi 2.0.1 telah hadir dengan fitur baru dan peningkatan performa. Segera perbarui aplikasi Anda untuk pengalaman terbaik.",
      },
      android: {
        priority: "high",
        notification: {
          channelId: "default_channel",
          sound: "default",
        },
      },
      // apns: {
      //   payload: {
      //     aps: {
      //       sound: "default",
      //     },
      //   },
      // },
    };
    const response = await fcm.sendEachForMulticast(message);
    console.log("🚀 ~ GET ~ response:", response)

    return createApiResponse({
      status: true,
      data: response,
      statusCode: 200
    });
  } catch (error) {
    console.log("🚀 ~ GET /api/v1/notification/test ~ error:", error)
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500
    });
  }
}