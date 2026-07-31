// @vitest-environment node

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import createToken, { createRefreshToken } from "../create_token";
import { jwtVerify } from "jose";
import { AUDIENCE, ISSUER } from "@/constants/v1/api";

const SECRET_KEY =
  "36d8341336c76af0e24f147a6e2dd5f7ae076055c488c60e02da0c50d603810d";

describe("lib/create_token", () => {
  beforeEach(() => {
    // Set environment variable untuk testing
    process.env.SIGNATURE_SECRET_KEY = SECRET_KEY;
  });

  describe("createToken", () => {
    it('harus menghasilkan JWT valid dengan role "guest" jika isUser = false', async () => {
      const sub = "user-123";
      const jti = "jti-uuid-456";

      const token = await createToken(sub, jti, false);

      // Verifikasi payload JWT yang dihasilkan
      const secret = new TextEncoder().encode(SECRET_KEY);
      const { payload } = await jwtVerify(token, secret);

      expect(payload.sub).toBe(sub);
      expect(payload.jti).toBe(jti);
      expect(payload.role).toBe("guest");
      expect(payload.iss).toBe(ISSUER);
      expect(payload.aud).toBe(AUDIENCE);
    });

    it('harus menghasilkan JWT dengan role "user" jika isUser = true', async () => {
      const sub = "user-123";
      const jti = "jti-uuid-456";

      const token = await createToken(sub, jti, true);

      const secret = new TextEncoder().encode(SECRET_KEY);
      const { payload } = await jwtVerify(token, secret);

      expect(payload.role).toBe("user");
    });
  });

  describe("createRefreshToken", () => {
    beforeEach(() => {
      // Mengunci waktu sistem agar hasil pengujian tanggal kadaluarsa konsisten
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("harus mengembalikan token UUID dan tanggal kadaluarsa 30 hari ke depan", async () => {
      const result = await createRefreshToken();

      // Validasi format UUIDv4
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result.token).toMatch(uuidRegex);

      // Validasi kadaluarsa: 1 Jan 2026 + 30 Hari = 31 Jan 2026
      const expectedExpiry = new Date("2026-01-31T00:00:00Z");
      expect(result.expiresAt.toISOString()).toBe(expectedExpiry.toISOString());
    });
  });
});
