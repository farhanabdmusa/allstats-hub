import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { errors, jwtVerify } from "jose";
import createApiResponse from './lib/create_api_response';
import { AUDIENCE, ISSUER } from './constants/v1/api';

const SECRET_KEY = new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (publicApiRoutes.includes(pathname)) {
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

const publicApiRoutes = [
    '/api/v1/auth/anonymous',
    '/api/v1/auth/refresh',
];