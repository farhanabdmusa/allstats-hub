"use server";

import { BUNDLE_ID } from "@/constants/v1/api";
import {
  createRemoteJWKSet,
  decodeJwt,
  jwtVerify,
  SignJWT,
  importPKCS8,
} from "jose";
import { JOSEError, JWTExpired } from "jose/errors";

async function verifyAppleToken(identityToken: string): Promise<{
  status: boolean;
  userId?: string;
  email?: string;
  name?: string;
  error?: string;
}> {
  try {
    // 1. Point to Apple's official public keys endpoint
    const AppleJWKS = createRemoteJWKSet(
      new URL("https://appleid.apple.com/auth/keys"),
    );

    // 2. Verify the token signature and validation claims
    const { payload } = await jwtVerify(identityToken, AppleJWKS, {
      issuer: "https://appleid.apple.com",
      audience: process.env.BUNDLE_ID,
    });

    const decoded = decodeJwt(identityToken);

    // 3. Extract the unique User ID (sub) and structural data
    const appleUserId = payload.sub;
    const email = decoded.email as string;
    const givenName = decoded.givenName as string | undefined | null;
    const familyName = decoded.familyName as string | undefined | null;

    return {
      status: true,
      userId: appleUserId,
      email: email,
      name: [givenName, familyName].join(" ").trim(),
    };
  } catch (err: unknown) {
    if (err instanceof JWTExpired) {
      return {
        status: false,
        error: "Expired Token",
      };
    }
    if (err instanceof JOSEError) {
      const error = err as JOSEError;
      return {
        status: false,
        error: error.code,
      };
    }
    if (err instanceof Error) {
      const error = err as Error;
      console.error("🚀 ~ verifyAppleToken ~ error:", error);

      return {
        status: false,
        error: error.message ?? "Unknown Error While Verify Apple Token",
      };
    }

    return {
      status: false,
      error: "Unknown Error While Verify Apple Token",
    };
  }
}

const getRefreshToken = async (
  authorizationCode: string,
): Promise<{
  status: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    const privateKey = await importPKCS8(
      process.env.APPLE_SECRET_KEY ?? "",
      "ES256",
    );

    const token = await new SignJWT()
      .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KID })
      .setIssuer(process.env.APPLE_TEAM_ID ?? "")
      .setIssuedAt()
      .setExpirationTime("10m")
      .setAudience("https://appleid.apple.com")
      .setSubject(BUNDLE_ID)
      .sign(privateKey);

    const headers = new Headers();
    headers.append("content-type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", BUNDLE_ID);
    urlencoded.append("client_secret", token);
    urlencoded.append("code", authorizationCode);
    urlencoded.append("grant_type", "authorization_code");

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
    };

    const request = await fetch(
      "https://appleid.apple.com/auth/token",
      requestOptions,
    );

    if (!request.ok) {
      const res = await request.json();
      return {
        status: false,
        error: `${res.error_description ?? res.error ?? `${request.status} ${request.statusText}`} (EAA-04)`,
      };
    }

    const response = await request.json();
    if (response.refresh_token) {
      return {
        status: true,
        token: response.refresh_token,
      };
    }

    return {
      status: false,
      error: "Unable to get token (EAA-05)",
    };
  } catch (error) {
    console.error("🚀 ~ getRefreshToken ~ error:", error);
    if (error instanceof JOSEError) {
      return {
        status: false,
        error: `${error.code} (EAA-06)`,
      };
    }

    return {
      status: false,
      error: "Unknown error while get token (EAA-07)",
    };
  }
};

const revokeToken = async (
  refreshToken: string,
): Promise<{
  status: boolean;
  token?: string;
  error?: string;
}> => {
  try {
    const privateKey = await importPKCS8(
      process.env.APPLE_SECRET_KEY ?? "",
      "ES256",
    );

    const token = await new SignJWT()
      .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KID })
      .setIssuer(process.env.APPLE_TEAM_ID ?? "")
      .setIssuedAt()
      .setExpirationTime("10m")
      .setAudience("https://appleid.apple.com")
      .setSubject(BUNDLE_ID)
      .sign(privateKey);

    const headers = new Headers();
    headers.append("content-type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", BUNDLE_ID);
    urlencoded.append("client_secret", token);
    urlencoded.append("token", refreshToken);
    urlencoded.append("token_type_hint", "refresh_token");

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: urlencoded,
    };

    const request = await fetch(
      "https://appleid.apple.com/auth/revoke",
      requestOptions,
    );

    if (!request.ok) {
      const res = await request.json();
      return {
        status: false,
        error: `${res.error_description ?? res.error ?? `${request.status} ${request.statusText}`} (EAART-01)`,
      };
    }

    return {
      status: true,
    };
  } catch (error) {
    console.error("🚀 ~ revokeToken ~ error:", error);
    if (error instanceof JOSEError) {
      return {
        status: false,
        error: `${error.code} (EAART-02)`,
      };
    }

    return {
      status: false,
      error: "Unknown error while reset authorization (EAART-03)",
    };
  }
};

export { verifyAppleToken, getRefreshToken, revokeToken };
