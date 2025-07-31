import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = new TextEncoder().encode(process.env.SIGNATURE_SECRET_KEY);

export async function GET(request: NextRequest) {
    const appKey = process.env.ALLSTATS_APP_KEY;
    const allowedOrigin = "Allstats BPS";

    const authHeader = request.headers.get("Authorization");
    const userAgent = request.headers.get("User-Agent");
    const authToken = authHeader?.split(' ')[1];

    if (authToken != appKey && userAgent != allowedOrigin) {
        return NextResponse.json(
            {
                status: false,
                message: 'Unauthorized'
            },
            { status: 401 }
        );
    }

    const payload = {
        role: "guest",
    }

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime("3h")
        .setAudience("allstats")
        .sign(SECRET_KEY);

    return NextResponse.json({
        status: true,
        token
    });
}