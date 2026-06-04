import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // TODO: consider caching if the topics are not frequently changed
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return createApiResponse({
        status: false,
        message: "Unauthorized",
        statusCode: 401,
      });
    }
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });
    const { sub, role } = jwt.payload;

    const result = await prisma.topic.findMany({
      omit: {
        user_select: true,
      },
      orderBy: {
        id: "asc",
      },
      include: {
        user_topic:
          role == "user"
            ? {
                select: {
                  subscribed_at: true,
                },
                where: {
                  id_user: Number(sub),
                },
              }
            : undefined,
      },
      where: {
        user_select: true,
      },
    });

    return createApiResponse({
      status: true,
      data: result.map((e) => ({
        id: e.id,
        name: e.name,
        id_display_name: e.id_display_name,
        en_display_name: e.en_display_name,
        selected_at: e.user_topic?.at(0)?.subscribed_at ?? null,
      })),
    });
  } catch (error) {
    console.log("🚀 ~ GET /api/v1/topic ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
}
