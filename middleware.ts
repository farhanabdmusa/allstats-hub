import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname == "/api/v1/token") {
        return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        await jwtVerify(
            token,
            SECRET_KEY,
            {
                audience: "allstats"
            }
        );
    } catch (e) {
        return NextResponse.json(
            {
                status: false,
                message: 'Invalid or expired token'
            },
            { status: 401 }
        );
    }

    return NextResponse.next();
}

// Matcher untuk semua route API publik
export const config = {
    matcher: ['/api/:path*'],
}
