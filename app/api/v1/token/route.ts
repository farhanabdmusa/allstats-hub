import { AUDIENCE } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import z from "zod";

const schema = z.object({
  token: z.string(),
});

export async function PUT(request: NextRequest) {
  try {
    const SECRET_KEY = new TextEncoder().encode(
      process.env.SIGNATURE_SECRET_KEY,
    );
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.split(" ")[1];
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });

    const uuid = jwt.payload.jti;

    const formData = await request.formData();

    const validatedData = schema.safeParse(
      Object.fromEntries(formData.entries()),
    );

    if (!validatedData.success) {
      const errors = z.treeifyError(validatedData.error);
      console.log("🚀 ~ PUT /api/v1/token ~ errors:", errors);
      return createApiResponse({
        status: false,
        message: "Invalid request data",
        statusCode: 200,
      });
    }

    await prisma.user_device.update({
      data: {
        fcm_token: validatedData.data.token,
      },
      where: {
        uuid: uuid,
      },
    });
    return createApiResponse({
      status: true,
    });
  } catch (error) {
    console.log("🚀 ~ PUT /api/v1/token ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 200,
    });
  }
}
