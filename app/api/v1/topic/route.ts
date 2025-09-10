import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";

export async function GET() {
    // TODO: consider caching if the topics are not frequently changed
    try {
        const result = await prisma.topic.findMany({
            orderBy: {
                id: "asc"
            },
            where: {
                // Only include topics that are selectable by users
                user_select: true,
                // TODO: consider limiting fields by createdAt or updatedAt
            }
            // TODO: consider pagination if the number of topics grows large
        });

        return createApiResponse({
            status: true,
            data: result,
        })
    } catch (error) {
        console.log("🚀 ~ GET /api/v1/topic ~ error:", error)
        return createApiResponse({
            status: false,
            message: "Internal Server Error",
            statusCode: 500,
        })
    }
}