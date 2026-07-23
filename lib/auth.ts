import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers/index";

const pstIssuer = process.env.PST_ISSUER ?? "https://sso-pst.bps.go.id";
const pstAuthorizationUrl =
  process.env.PST_AUTHORIZATION_URL ?? `${pstIssuer}/oauth/authorize`;
const pstTokenUrl = process.env.PST_TOKEN_URL ?? `${pstIssuer}/oauth/token`;
const pstUserProfileUrl =
  process.env.PST_USERINFO_URL ?? `${pstIssuer}/api/user`;

const pstProvider: Provider = {
  id: "pst",
  name: "SSO PST",
  type: "oauth" as const,
  authorization: {
    url: pstAuthorizationUrl,
    params: {
      scope: "read-user",
      response_type: "code",
    },
  },
  token: {
    url: pstTokenUrl,
    params: {
      grant_type: "authorization_code",
    },
  },
  userinfo: {
    request: async ({ tokens }) => {
      const response = await fetch(pstUserProfileUrl, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch PST user profile: ${response.status} ${response.statusText}`,
        );
      }

      const payload = await response.json();
      return payload.data ?? payload.user ?? payload;
    },
  },
  clientId: process.env.PST_CLIENT_ID,
  clientSecret: process.env.PST_CLIENT_SECRET,
  checks: ["state"],
  profile(profile: Record<string, unknown>) {
    return {
      id: String(profile.uuid),
      name:
        (profile.name as string | undefined) ??
        (profile.full_name as string | undefined) ??
        (profile.username as string | undefined) ??
        (profile.email as string | undefined) ??
        "PST User",
      email: (profile.email as string | undefined) ?? null,
      image:
        (profile.avatar as string | undefined) ??
        (profile.picture as string | undefined) ??
        null,
    };
  },
};

export const authOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  providers: [pstProvider],
};

export const handler = NextAuth(authOptions);
