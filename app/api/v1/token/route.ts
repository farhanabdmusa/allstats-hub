import { ALLOWED_ORIGIN, APP_KEY, AUDIENCE, ISSUER, SECRET_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import { getCurrentDateTime } from "@/lib/jakarta_datetime";
import prisma from "@/lib/prisma";
import { CreateUserPayload } from "@/types/user";
import UserSchema from "@/zod/user_schema";
import { ipAddress } from "@vercel/functions";
import { SignJWT } from "jose";
import type { NextRequest } from "next/server";
import z from "zod";

const createToken = async (aud: string) => {
    const payload = {
        role: "guest",
    }

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer(ISSUER)
        .setIssuedAt()
        .setExpirationTime("3h")
        .setAudience(AUDIENCE)
        .setSubject(aud)
        .sign(SECRET_KEY);

    return token;
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");
        const authToken = authHeader?.split(' ')[1];
        const userAgent = request.headers.get("User-Agent");

        if (authToken != APP_KEY && userAgent != ALLOWED_ORIGIN) {
            return createApiResponse({
                status: false,
                message: 'Unauthorized',
                statusCode: 401,
            });
        }

        const formData = await request.json() as CreateUserPayload;
        const last_ip = ipAddress(request);
        formData["last_ip"] = last_ip;

        const validatedData = UserSchema.safeParse(formData);

        if (!validatedData.success) {
            const errors = z.treeifyError(validatedData.error);
            return createApiResponse({
                status: false,
                zodError: errors,
            })
        }

        const token = await prisma.$transaction(async (tx) => {
            const userId = await tx.user.upsert({
                create: validatedData.data,
                update: {
                    ...validatedData.data,
                    last_session: getCurrentDateTime()!
                },
                where: {
                    uuid: validatedData.data.uuid
                },
                select: {
                    id: true,
                },
            })

            await tx.user_preference.upsert({
                create: {
                    id_user: userId.id,
                    lang: validatedData.data.lang || "id",
                    domain: validatedData.data.domain || "0000",
                },
                update: {
                    lang: validatedData.data.lang || "id",
                    domain: validatedData.data.domain || "0000",
                },
                where: {
                    id_user: userId.id
                }
            });

            const token = await createToken(userId.id.toString());

            await tx.user.update({
                data: {
                    access_token: token
                },
                where: {
                    id: userId.id
                }
            })

            return token;
        });

        return createApiResponse({
            status: true,
            data: { token }
        });
    } catch (error) {
        console.log("🚀 ~ POST /api/v1/user:", error)
        return createApiResponse({
            status: false,
            message: "Failed to insert user",
            statusCode: 500,
        })
    }
}