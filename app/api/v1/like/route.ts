import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";
import type { NextRequest } from "next/server";
import z from "zod";

const LikeSchema = z.object({
    user_id: z.int(),
    product_type: z.int(),
    mfd: z.string(),
    product_id: z.string(),
})

const like = ({
    product_id,
    product_type,
    user_id,
    mfd,
}: {
    user_id: number;
    product_type: number;
    product_id: string;
    mfd: string;
}) => {
    return prisma.$transaction(async (tx) => {
        await tx.user_like_product.create({
            data: {
                product_id,
                product_type,
                user_id,
                mfd,
            }
        });

        const total = await tx.like_counter.upsert({
            select: {
                total: true,
            },
            where: {
                mfd_product_type_product_id: {
                    product_id,
                    product_type,
                    mfd,
                }
            },
            create: {
                product_id,
                product_type,
                mfd,
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
    product_type,
    user_id,
    mfd,
}: {
    user_id: number;
    product_type: number;
    product_id: string;
    mfd: string;
}) => {
    return prisma.$transaction(async (tx) => {
        await tx.user_like_product.delete({
            where: {
                user_id_mfd_product_type_product_id: {
                    product_id,
                    product_type,
                    mfd,
                    user_id
                }
            }
        });

        const total = await tx.like_counter.upsert({
            select: {
                total: true,
            },
            where: {
                mfd_product_type_product_id: {
                    product_id,
                    product_type,
                    mfd,
                }
            },
            create: {
                product_id,
                product_type,
                mfd,
                total: 0,
            },
            update: {
                total: { decrement: 1 }
            }
        })

        return total.total;
    })

}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const product_id = searchParams.get("product_id");
    const mfd = searchParams.get("mfd");
    const product_type = Number(searchParams.get("product_type"));

    const schema = z.object({
        product_id: z.string(),
        product_type: z.int(),
        mfd: z.string(),
    });

    const validatedData = schema.safeParse({
        product_id,
        product_type,
        mfd,
    })

    if (!validatedData.success) {
        return createApiResponse({
            status: false,
            statusCode: 422,
            zodError: z.treeifyError(validatedData.error),
        })
    }

    const result = await prisma.like_counter.findUnique({
        where: {
            mfd_product_type_product_id: validatedData.data
        }
    })
    return createApiResponse({
        status: true,
        data: {
            total: result?.total ?? 0
        }
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
                user_id_mfd_product_type_product_id: validatedData.data
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