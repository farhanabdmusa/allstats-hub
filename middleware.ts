import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { errors, jwtVerify } from "jose";
import createApiResponse from './lib/create_api_response';
import { AUDIENCE, ISSUER } from './constants/v1/api';

const SECRET_KEY = new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname == "/api/v1/token") {
        return NextResponse.next();
    } else if (pathname == "/api/v1/user" && request.method === "GET") {
        return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return createApiResponse({
            status: false,
            message: 'Unauthorized',
            statusCode: 401
        });
    }

    try {
        await jwtVerify(
            token,
            SECRET_KEY,
            {
                audience: AUDIENCE,
                issuer: ISSUER,
            }
        );
    } catch (err) {
        if (err instanceof errors.JWTExpired) {
            return createApiResponse({
                status: false,
                message: 'Expired Token',
                statusCode: 401
            });
        }
        console.log(`🚀 ~ middleware ~ path ${pathname} ~ err:`, err)

        return createApiResponse({
            status: false,
            message: 'Unauthorized',
            statusCode: 401
        });

    }

    return NextResponse.next();
}

// Matcher untuk semua route API publik
export const config = {
    matcher: ['/api/:path*'],
}
