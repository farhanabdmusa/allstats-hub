"use server"

import { SignJWT } from "jose";
import { AUDIENCE, ISSUER, SECRET_KEY } from "@/constants/v1/api";

const createToken = async (aud: string, jti: string) => {
    const payload = {
        role: "guest",
    }

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer(ISSUER)
        .setIssuedAt()
        .setExpirationTime("3h")
        .setAudience(AUDIENCE)
        .setSubject(aud)
        .setJti(jti)
        .sign(SECRET_KEY);

    return token;
}

export default createToken;