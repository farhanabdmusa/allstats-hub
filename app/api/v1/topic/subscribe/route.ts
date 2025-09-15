import { AUDIENCE, SECRET_KEY } from "@/constants/v1/api";
import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import z from "zod";

const scheme = z.object({
    topic_selected: z.array(z.number()),
})

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.split(' ')[1];
        const jwt = await jwtVerify(
            token!,
            SECRET_KEY,
            { audience: AUDIENCE }
        );

        const userId = Number(jwt.payload.sub!);

        if (Number.isNaN(userId)) {
            return createApiResponse({
                status: false,
                message: "User not found",
                statusCode: 404
            })
        }

        const formData = await request.json();

        const validatedData = scheme.safeParse(formData)

        if (!validatedData.success) {
            const errors = z.treeifyError(validatedData.error);
            console.log("🚀 ~ POST /api/v1/topic/subscribe ~ errors:", errors)
            return createApiResponse({
                status: false,
                message: "Invalid request data",
                statusCode: 400
            })
        }

        const topic_preferences = await prisma.$transaction(async (tx) => {
            await tx.user_preference.update(
                {
                    data: {
                        topic_selection: true,
                    },
                    where: {
                        id_user: userId
                    }
                }
            );

            await tx.user_topic.deleteMany({
                where: {
                    id_user: userId,
                    id_topic: {
                        notIn: validatedData.data.topic_selected
                    }
                },
            });

            await tx.user_topic.createMany({
                data: validatedData.data.topic_selected.map((id_topic) => ({
                    id_user: userId,
                    id_topic,
                })),
                skipDuplicates: true,
            });

            return tx.user_topic.findMany({
                where: {
                    id_user: userId,
                },
                select: {
                    topic: {
                        omit: {
                            user_select: true,
                        }
                    },
                    subscribed_at: true,
                }
            })
        })
        return createApiResponse({
            status: true,
            data: topic_preferences,
        })
    } catch (error) {
        console.log("🚀 ~ POST /api/v1/topic/subscribe ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500
        })
    }
}