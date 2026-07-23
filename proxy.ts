import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import createApiResponse from "./lib/create_api_response";
import { AUDIENCE } from "./constants/v1/api";
import { JOSEError, JWTExpired } from "jose/errors";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return createApiResponse({
      status: false,
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  try {
    const SECRET_KEY = new TextEncoder().encode(
      process.env.SIGNATURE_SECRET_KEY,
    );
    const jwt = await jwtVerify(token!, SECRET_KEY, { audience: AUDIENCE });
    const { sub, jti, role } = jwt.payload;
    if (!sub || !jti || !role) {
      return createApiResponse({
        status: false,
        message: "Invalid Token",
        statusCode: 403,
      });
    }
  } catch (err) {
    console.log(`🚀 ~ middleware ~ path ${pathname} ~ err:`, err);
    if (err instanceof JWTExpired) {
      return createApiResponse({
        status: false,
        message: "Expired Token",
        statusCode: 401,
      });
    }

    if (err instanceof JOSEError) {
      return createApiResponse({
        status: false,
        message: err.code,
        statusCode: 401,
      });
    }
    return createApiResponse({
      status: false,
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  return NextResponse.next();
}

// Matcher untuk semua route API publik
export const config = {
  matcher: ["/api/:path*"],
};

const publicApiRoutes = [
  "/api/v1/auth/anonymous",
  "/api/v1/auth/refresh",
  "/api/v1/auth/signin/callbacks/pst",
];
