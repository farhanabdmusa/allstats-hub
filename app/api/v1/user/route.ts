import { type NextRequest } from "next/server";
import { ipAddress } from '@vercel/functions'
import prisma from "@/lib/prisma";
import { CreateUserPayload } from '@/types/user';
import createApiResponse from "@/lib/create_api_response";
import { convertDate2String, getCurrentDateTime } from "@/lib/jakarta_datetime";
import z from "zod";

const UserSchema = z.object({
    uuid: z.string("UUID is required"),
    email: z.email().optional(),
    manufacturer: z.string().optional(),
    device_model: z.string().optional(),
    os: z.string().optional(),
    os_version: z.string().optional(),
    is_virtual: z.boolean().optional(),
    last_ip: z.ipv4().optional(),
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = Number(searchParams.get("id"));
    if (!id || Number.isNaN(id)) {
        return createApiResponse({
            status: false,
            message: "Invalid or missing 'id' parameter",
            statusCode: 422,
        });
    }


    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: { id },
            include: {
                sign_up_type_name: {
                    select: {
                        name: true
                    }
                }
            }
        })
        const result = {
            ...user,
            first_session: convertDate2String(user.first_session),
            last_session: convertDate2String(user.last_session)
        }

        return createApiResponse({
            status: true,
            data: result,
        })
    } catch (error) {
        console.log("🚀 ~ GET /api/v1/user:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500,
        })
    }
}

export async function POST(request: NextRequest) {
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

    try {
        await prisma.user.upsert({
            create: formData,
            update: {
                ...formData,
                last_session: getCurrentDateTime()!
            },
            where: {
                uuid: formData.uuid
            }
        })

        return createApiResponse({
            status: true,
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