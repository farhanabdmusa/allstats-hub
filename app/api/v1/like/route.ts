import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";
import z from "zod";

const LikeSchema = z.object({
    user_id: z.int(),
    type: z.int(),
    product_id: z.int(),
})

const like = ({
    product_id,
    type,
    user_id
}: {
    user_id: number;
    type: number;
    product_id: number;
}) => {
    return prisma.$transaction(async (tx) => {
        await tx.user_like_product.create({
            data: {
                product_id: product_id,
                product_type: type,
                user_id: user_id,
            }
        });

        const total = await tx.like_counter.upsert({
            select: {
                total: true,
            },
            where: {
                product_type_product_id: {
                    product_id: product_id,
                    product_type: type,
                }
            },
            create: {
                product_id: product_id,
                product_type: type,
                total: 1
            },
            update: {
                total: { increment: 1 }
            }
        })

        return total.total;
    })

}

const unlike = ({
    product_id,
    type,
    user_id
}: {
    user_id: number;
    type: number;
    product_id: number;
}) => {
    return prisma.$transaction(async (tx) => {
        await tx.user_like_product.delete({
            where: {
                user_id_product_type_product_id: {
                    product_id: product_id,
                    product_type: type,
                    user_id: user_id,
                }
            }
        });

        const total = await tx.like_counter.upsert({
            select: {
                total: true,
            },
            where: {
                product_type_product_id: {
                    product_id: product_id,
                    product_type: type,
                }
            },
            create: {
                product_id: product_id,
                product_type: type,
                total: 1
            },
            update: {
                total: { decrement: 1 }
            }
        })

        return total.total;
    })

}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.json();

        const validatedData = LikeSchema.safeParse(formData);
        if (!validatedData.success) {
            const errors = z.treeifyError(validatedData.error);
            return createApiResponse({
                status: false,
                zodError: errors,
            })
        }
        const check = await prisma.user_like_product.findUnique({
            where: {
                user_id_product_type_product_id: {
                    product_id: validatedData.data.product_id,
                    product_type: validatedData.data.type,
                    user_id: validatedData.data.user_id,
                }
            }
        })
        const result = check == null
            ? await like(validatedData.data)
            : await unlike(validatedData.data);

        return createApiResponse({
            status: true,
            data: {
                type: check == null ? "like" : "unlike",
                total: result
            }
        })
    } catch (error) {
        console.log("🚀 ~ POST /api/v1/like ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500,
        })
    }
}