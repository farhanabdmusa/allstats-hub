import createApiResponse from "@/lib/create_api_response";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const result = await prisma.topic.findMany({
            orderBy: {
                id: "asc"
            },
            // TODO: consider pagination if the number of topics grows large
            // TODO: consider limiting fields by createdAt or updatedAt
            // TODO: consider caching if the topics are not frequently changed
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