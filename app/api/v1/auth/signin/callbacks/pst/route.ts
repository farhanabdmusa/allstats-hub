import createApiResponse from "@/lib/create_api_response";

export async function GET() {
  return createApiResponse({
    status: true,
  });
}
