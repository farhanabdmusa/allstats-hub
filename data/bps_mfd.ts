"use server";

import { BPSDomain, BPSDomainResponse } from "@/types/bps_domain";
import { SignJWT } from "jose";

const getDomain = async (): Promise<{
  status: boolean;
  message?: string;
  data?: BPSDomain[];
}> => {
  try {
    const token = await new SignJWT({ action: "domain", model: "" })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuer(process.env.WEBAPI_ISSUER ?? "")
      .sign(new TextEncoder().encode(process.env.WEBAPI_PRIVATE_KEY ?? ""));

    const url = new URL(
      `https://web-api.bps.go.id/v2/api/domain?type=all&key=${process.env.WEBAPI_PUBLIC_KEY}`,
    );

    const req = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    });

    if (!req.ok) {
      return { status: false, message: req.statusText };
    }
    const jsonData: BPSDomainResponse = await req.json();
    if (jsonData.status !== "OK") {
      throw new Error(jsonData.message || "Unknown error occurred");
    }

    return {
      status: true,
      data: jsonData.data?.[1] ?? [],
    };
  } catch (e) {
    console.log("🚀 ~ getDomain ~ e:", e);
    return {
      status: false,
      message: `Failed to get BPS Domain Data. Trace: ${e}`,
    };
  }
};

export default getDomain;
