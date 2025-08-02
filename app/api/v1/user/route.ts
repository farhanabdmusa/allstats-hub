import { type NextRequest } from "next/server";
import { ipAddress } from '@vercel/functions'
import prisma from "@/lib/prisma";
import createApiResponse from "@/lib/create_api_response";
import { convertDate2String } from "@/lib/jakarta_datetime";
import z from "zod";
import { jwtVerify } from "jose";
import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import UserSchema from "@/zod/user_schema";

export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        const jwt = await jwtVerify(
            token!,
            SECRET_KEY,
            { audience: AUDIENCE }
        );
        const userId = Number(jwt.payload.sub!);

        const check = await prisma.user.findUnique({
            select: {
                id: true
            },
            where: {
                id: userId
            }
        })
        if (!check) {
            return createApiResponse({
                status: false,
                message: "User not found",
                statusCode: 404
            })
        }

        const formData = await request.json();

        const validatedData = UserSchema.safeParse({
            ...formData,
            user_id: userId
        })
        if (!validatedData.success) {
            const errors = z.treeifyError(validatedData.error);
            return createApiResponse({
                status: false,
                zodError: errors,
            })
        }
        const last_ip = ipAddress(request);

        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: { ...validatedData.data, last_ip }
        })

        return createApiResponse({
            status: true,
            data: {
                ...user,
                first_session: convertDate2String(user.first_session),
                last_session: convertDate2String(user.last_session),
            },
        })
    } catch (error) {
        console.log("🚀 ~ PUT /api/v1/user ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500,
        })
    }
}