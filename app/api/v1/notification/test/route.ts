import createApiResponse from "@/lib/create_api_response";
import { fcm } from "@/lib/firebase_admin";
import { TokenMessage } from "firebase-admin/messaging"

export async function GET() {
  try {
    const token = "fFq3dNYRSlmXpasmBrQnrM:APA91bFK_uDe7P0hT1ObBkngCnP0yufskC9CbjG4MnGGvkMvj00IdlWVUnA4WcQLPJjO6ePQCzbXvi6NAiGbV4tAj2_FSO6CYDFSO4uZ_6ZHltxVU3f6YwY";

    const message: TokenMessage = {
      token: token,
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

    const response = await fcm.send(message);
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