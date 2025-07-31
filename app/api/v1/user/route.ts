import { NextResponse, type NextRequest } from "next/server";
import { ipAddress } from '@vercel/functions'
import prisma from "@/lib/prisma";
import { CreateUserPayload } from '@/types/user';
import { ApiResponse } from "@/types/response";
import createApiResponse from "@/lib/create_api_response";

export async function POST(request: NextRequest) {
    const formData = await request.json() as CreateUserPayload;
    const last_ip = ipAddress(request);
    formData["last_ip"] = last_ip;

    if (!formData["uuid"]) {
        return NextResponse.json<ApiResponse>({
            status: false,
        })
    }

    try {
        await prisma.user.create({
            data: formData,
            select: { id: true }
        })

        return createApiResponse({
            status: true,
        });
    } catch (error) {
        console.log("🚀 ~ POST user ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Failed to insert user",
            statusCode: 500,
        })
    }

}