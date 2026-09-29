import { NextRequest, NextResponse } from "next/server";

const deepLinkGenerator = (searchParams: URLSearchParams) => {
  return `intent://callback?${searchParams.toString()}#Intent;package=id.go.bps.allstats;scheme=signinwithapple;end`;
};

export async function POST(request: NextRequest) {
  console.log("🚀 ~ POST ~ request:", request);
  const formData = await request.formData();
  console.log("🚀 ~ POST ~ formData:", formData);
  const searchParams = new URLSearchParams();
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      searchParams.append(key, value);
    }
  });

  try {
    return NextResponse.redirect(deepLinkGenerator(searchParams), 302);
  } catch (error) {
    console.log("🚀 ~ POST /api/v1/auth/signin/callbacks/apple:", error);
    return NextResponse.redirect(deepLinkGenerator(searchParams), 302);
  }
}
