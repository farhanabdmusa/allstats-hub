import createApiResponse from "@/lib/create_api_response";

function handleNotFound() {
  return createApiResponse({
    status: false,
    statusCode: 404,
  });
}

// Export handlers for all expected standard HTTP methods
export async function GET() {
  return handleNotFound();
}
export async function POST() {
  return handleNotFound();
}
export async function PUT() {
  return handleNotFound();
}
export async function PATCH() {
  return handleNotFound();
}
export async function DELETE() {
  return handleNotFound();
}
export async function OPTIONS() {
  return handleNotFound();
}
