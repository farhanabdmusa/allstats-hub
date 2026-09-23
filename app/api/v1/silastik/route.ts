import createApiResponse from "@/lib/create_api_response";
import { SilastikResponse } from "@/types/silastik";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idTranscation = searchParams.get("transaction-id");

    if (!idTranscation) {
      return createApiResponse({
        status: false,
        message: "Transaction ID is required",
        statusCode: 402,
      });
    }

    const url = new URL("/v3/index.php", "https://silastik.bps.go.id");
    url.searchParams.set("key", process.env.SILASTIK_KEY ?? "");
    url.searchParams.set("r", "api/status");
    url.searchParams.set("id_transaksi", idTranscation);

    const req = await fetch(url);

    if (!req.ok) {
      return createApiResponse({ status: false, message: req.statusText });
    }
    const jsonData: SilastikResponse = await req.json();

    return createApiResponse({
      status: true,
      data: jsonData,
    });
  } catch (error) {
    console.log("🚀 ~ GET /api/v1/silastik ~ error:", error);
    return createApiResponse({
      status: false,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
}
