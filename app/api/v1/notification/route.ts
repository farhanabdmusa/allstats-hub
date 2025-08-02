import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const result = await prisma.notification.findMany({
            orderBy: {
                timestamp: "desc"
            },
            take: 10,
        });

        return createApiResponse({
            status: true,
            data: result,
        })
    } catch (error) {
        console.log("🚀 ~ GET /api/v1/notification ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500,
        })
    }
}