import NextAuth, { AuthOptions } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import prisma from "@/lib/prisma";
import { getCurrentDateTime } from "./jakarta_datetime";

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

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },

  providers: [pstProvider],
  pages: {
    error: "/authentication",
  },
  callbacks: {
    async signIn({
      user,
    }: {
      user: {
        email?: string | null;
        name?: string | null;
        id?: string | null;
      };
    }) {
      console.log(new Date());
      console.log(getCurrentDateTime());
      const email = user.email?.trim().toLowerCase();
      const name = user.name?.trim().toLowerCase();
      const uuid = user.id?.trim();

      if (!email || !name || !uuid) {
        throw new Error("Unknown User");
      }

      const adminUser = await prisma.user_admin.findUnique({
        where: {
          email,
        },
        select: {
          is_admin: true,
        },
      });

      if (adminUser == null) {
        await prisma.user_admin.create({
          data: {
            email: email,
            name: name,
            uuid: uuid,
          },
        });
      }

      if (!adminUser?.is_admin) {
        throw new Error("Unauthorized User");
      }

      prisma.user_admin.update({
        where: {
          email: email,
        },
        data: {
          last_signin_at: getCurrentDateTime(),
        },
      });

      return true;
    },
  },
};

export const handler = NextAuth(authOptions);
