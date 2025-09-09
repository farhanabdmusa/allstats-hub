import { type NextRequest } from "next/server";
import { ipAddress } from '@vercel/functions'
import prisma from "@/lib/prisma";
import createApiResponse from "@/lib/create_api_response";
import { convertDate2String } from "@/lib/jakarta_datetime";
import z from "zod";
import { jwtVerify } from "jose";
import { ALLOWED_ORIGIN, APP_KEY, AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import { UpdateUserPayload } from "@/zod/user_schema";

export async function GET(request: NextRequest) {
    let userId: number = NaN;
    try {
        const uuid = request.nextUrl.searchParams.get("uuid")
        const authHeader = request.headers.get('authorization');
        if (uuid) {
            const authToken = authHeader?.split(' ')[1];
            const userAgent = request.headers.get("User-Agent");

            if (!(authToken && userAgent && authToken == APP_KEY && userAgent == ALLOWED_ORIGIN)) {
                return createApiResponse({
                    status: false,
                    message: 'Unauthorized',
                    statusCode: 401,
                });
            }
        } else {
            if (!authHeader) {
                return createApiResponse({
                    status: false,
                    message: 'Unauthorized',
                    statusCode: 401,
                });
            }
            const token = authHeader?.split(' ')[1];
            const jwt = await jwtVerify(
                token!,
                SECRET_KEY,
                { audience: AUDIENCE }
            );
            userId = Number(jwt.payload.sub!);
        }

        const user = await prisma.user.findUnique({
            omit: {
                id: true,
                access_token: true,
            },
            where: {
                id: !Number.isNaN(userId) ? userId : undefined,
                uuid: Number.isNaN(userId) && uuid ? uuid : undefined
            },
            include: {
                user_preference: {
                    select: {
                        domain: true,
                        lang: true,
                    }
                }
            }
        })
        if (!user) {
            return createApiResponse({
                status: false,
                message: "User not found",
                statusCode: 404
            })
        }

        return createApiResponse({
            status: true,
            data: {
                ...user,
                first_session: convertDate2String(user.first_session),
                last_session: convertDate2String(user.last_session),
            },
        })
    } catch (error) {
        console.log("🚀 ~ GET /api/v1/user ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500,
        })
    }
}

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
            console.log("🚀 ~ PUT ~ check:", check)
            return createApiResponse({
                status: false,
                message: "User not found",
                statusCode: 404
            })
        }

        const formData = await request.json();
        const last_ip = ipAddress(request);

        const validatedData = UpdateUserPayload.safeParse({
            ...formData,
            user_id: userId,
            last_ip: last_ip,
        })
        if (!validatedData.success) {
            const errors = z.treeifyError(validatedData.error);
            console.log("🚀 ~ PUT ~ errors:", errors)
            return createApiResponse({
                status: false,
                zodError: errors,
            })
        }

        const user = await prisma.user.update({
            omit: {
                id: true,
                access_token: true,
            },
            where: {
                id: userId
            },
            data: {
                uuid: validatedData.data.uuid ?? undefined,
                email: validatedData.data.email ?? undefined,
                manufacturer: validatedData.data.manufacturer ?? undefined,
                device_model: validatedData.data.device_model ?? undefined,
                os: validatedData.data.os ?? undefined,
                fcm_token: validatedData.data.fcm_token ?? undefined,
                is_virtual: validatedData.data.is_virtual ?? undefined,
                last_ip: validatedData.data.last_ip ?? undefined,
                os_version: validatedData.data.os_version ?? undefined,
                sign_up_type: validatedData.data.sign_up_type ?? undefined,
                new_version: validatedData.data.new_version ?? undefined,
                last_session: validatedData.data.last_session ?? undefined,
                user_preference: {
                    update: {
                        lang: validatedData.data.lang ?? undefined,
                        domain: validatedData.data.domain ?? undefined,
                    }
                }
            }
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