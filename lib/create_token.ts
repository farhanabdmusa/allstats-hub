"use server";

import { SignJWT } from "jose";
import { AUDIENCE, ISSUER, SECRET_KEY } from "@/constants/v1/api";

const createToken = async (
  sub: string,
  jti: string,
  isUser: boolean = false,
) => {
  const payload = {
    role: isUser ? "user" : "guest",
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("3h")
    .setAudience(AUDIENCE)
    .setSubject(sub)
    .setJti(jti)
    .sign(SECRET_KEY);

  return token;
};

export const createRefreshToken = async () => {
  const refreshToken = crypto.randomUUID();
  const refreshTokenExpiresAt = new Date();
  refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 30); // Set expiry 30 days from now

  return {
    token: refreshToken,
    expiresAt: refreshTokenExpiresAt,
  };
};

export default createToken;
