import { ALLOWED_ORIGIN, APP_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import createToken from "@/lib/create_token";
import prisma from "@/lib/prisma";
import UserSchema from "@/zod/user_schema";
import { ipAddress } from "@vercel/functions";
import type { NextRequest } from "next/server";
import z from "zod";

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

        const formData = await request.json();
        const last_ip = ipAddress(request);
        formData["last_ip"] = last_ip;

        const validatedData = UserSchema.safeParse(formData);

        if (!validatedData.success) {
            const errors = z.treeifyError(validatedData.error);
            console.log("🚀 ~ POST /api/v1/token:", errors.properties)
            return createApiResponse({
                status: false,
                zodError: errors,
            })
        }

        const where = validatedData.data.email ? { email: validatedData.data.email } : { uuid: validatedData.data.uuid };

        const token = await prisma.$transaction(async (tx) => {
            const userId = await tx.user.upsert({
                create: {
                    uuid: validatedData.data.uuid,
                    email: validatedData.data.email,
                    manufacturer: validatedData.data.manufacturer,
                    device_model: validatedData.data.device_model,
                    os: validatedData.data.os,
                    first_session: validatedData.data.first_session ?? undefined,
                    fcm_token: validatedData.data.fcm_token,
                    is_virtual: validatedData.data.is_virtual,
                    last_ip: validatedData.data.last_ip,
                    os_version: validatedData.data.os_version,
                    sign_up_type: validatedData.data.sign_up_type,
                    new_version: validatedData.data.new_version ?? undefined,
                    last_session: validatedData.data.last_session ?? undefined,
                },
                update: {
                    uuid: validatedData.data.uuid,
                    email: validatedData.data.email,
                    manufacturer: validatedData.data.manufacturer,
                    device_model: validatedData.data.device_model,
                    os: validatedData.data.os,
                    fcm_token: validatedData.data.fcm_token,
                    is_virtual: validatedData.data.is_virtual,
                    last_ip: validatedData.data.last_ip,
                    os_version: validatedData.data.os_version,
                    sign_up_type: validatedData.data.sign_up_type,
                    new_version: validatedData.data.new_version ?? undefined,
                    last_session: validatedData.data.last_session ?? undefined,
                },
                where: where,
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
        console.log("🚀 ~ POST /api/v1/token:", error)
        return createApiResponse({
            status: false,
            message: "Failed to insert user",
            statusCode: 500,
        })
    }
}