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


        const update = await prisma.$transaction(async (tx) => {
            const user_device = await tx.user_device.findFirst({
                where: {
                    uuid: validatedData.data.uuid
                }
            });
            if (user_device && user_device.id_user) {
                const token = await createToken(user_device.id_user.toString(), validatedData.data.uuid);
                const refreshToken = crypto.randomUUID();
                const refreshTokenExpiresAt = new Date();
                refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // Set expiry 30 days from now
                // Update user, user_device
                const updatedUser = await tx.user.update({
                    where: {
                        id: user_device.id_user
                    },
                    data: {
                        name: validatedData.data.name,
                        email: validatedData.data.email,
                        sign_up_type: validatedData.data.sign_up_type,
                        user_device: {
                            update: {
                                where: {
                                    id_user_uuid: {
                                        id_user: user_device.id_user,
                                        uuid: validatedData.data.uuid!
                                    }
                                },
                                data: {
                                    manufacturer: validatedData.data.manufacturer,
                                    device_model: validatedData.data.device_model,
                                    os: validatedData.data.os,
                                    first_session: validatedData.data.first_session ?? undefined,
                                    fcm_token: validatedData.data.fcm_token,
                                    is_virtual: validatedData.data.is_virtual,
                                    last_ip: validatedData.data.last_ip,
                                    os_version: validatedData.data.os_version,
                                    new_version: validatedData.data.new_version ?? undefined,
                                    last_session: validatedData.data.last_session ?? undefined,
                                    access_token: token,
                                    refresh_token: refreshToken,
                                    refresh_token_expires_at: refreshTokenExpiresAt,
                                }
                            }
                        },
                        user_preference: {
                            update: {
                                lang: validatedData.data.lang ?? undefined,
                                domain: validatedData.data.domain ?? undefined,
                                topic_selection: validatedData.data.topic_selection ?? undefined,
                            }
                        }
                    },
                    include: {
                        user_preference: {
                            select: {
                                domain: true,
                                lang: true,
                                topic_selection: true,
                            }
                        },
                    }
                });

                return {
                    access_token: token,
                    refresh_token: refreshToken,
                    ...updatedUser.user_preference,
                };
            } else {
                const user = await tx.user.create({
                    data: {
                        name: validatedData.data.name,
                        email: validatedData.data.email,
                        sign_up_type: validatedData.data.sign_up_type,
                        user_device: {
                            create: {
                                uuid: validatedData.data.uuid,
                                manufacturer: validatedData.data.manufacturer,
                                device_model: validatedData.data.device_model,
                                os: validatedData.data.os,
                                first_session: validatedData.data.first_session ?? undefined,
                                fcm_token: validatedData.data.fcm_token,
                                is_virtual: validatedData.data.is_virtual,
                                last_ip: validatedData.data.last_ip,
                                os_version: validatedData.data.os_version,
                                new_version: validatedData.data.new_version ?? undefined,
                                last_session: validatedData.data.last_session ?? undefined,
                            }
                        },
                        user_preference: {
                            create: {
                                lang: validatedData.data.lang || "id",
                                domain: validatedData.data.domain || "0000",
                                topic_selection: false,
                            }
                        }
                    },
                    select: {
                        id: true,
                        user_preference: {
                            select: {
                                domain: true,
                                lang: true,
                                topic_selection: true,
                            }
                        }
                    }
                });
                const token = await createToken(user.id.toString(), validatedData.data.uuid);
                const refreshToken = crypto.randomUUID();
                await tx.user_device.update({
                    where: {
                        id_user_uuid: {
                            id_user: user.id,
                            uuid: validatedData.data.uuid!,
                        }
                    },
                    data: {
                        access_token: token,
                        refresh_token: refreshToken,
                    }
                });
                return {
                    access_token: token,
                    refresh_token: refreshToken,
                    ...user.user_preference,
                };
            }
        });

        return createApiResponse({
            status: true,
            data: update,
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