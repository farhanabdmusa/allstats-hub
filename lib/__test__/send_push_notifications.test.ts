import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { fcm } from "@/lib/firebase_admin";
import prisma from "../prisma";
import { PushNotificationService } from "../send_push_notifications";

// 1. Mocking External Modules
vi.mock("@/lib/firebase_admin", () => ({
  fcm: {
    sendEachForMulticast: vi.fn(),
    send: vi.fn(),
  },
}));

vi.mock("../prisma", () => ({
  default: {
    user_device: {
      deleteMany: vi.fn(),
    },
  },
}));

describe("PushNotificationService", () => {
  const dummyPayload = {
    id_title: "Judul ID",
    id_body: "Pesan ID",
    en_title: "Title EN",
    en_body: "Body EN",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendNotificationMultiToken", () => {
    it("harus mengembalikan success: false jika idTokens dan enTokens kosong", async () => {
      const result = await PushNotificationService.sendNotificationMultiToken({
        idTokens: [],
        enTokens: [],
        payload: dummyPayload,
      });

      expect(result).toEqual({ success: false, staleTokens: [] });
      expect(fcm.sendEachForMulticast).not.toHaveBeenCalled();
    });

    it("harus throw error jika jumlah token melebihi limit 500", async () => {
      const oversizedTokens = new Array(501).fill("token_dummy");

      await expect(
        PushNotificationService.sendNotificationMultiToken({
          idTokens: oversizedTokens,
          enTokens: [],
          payload: dummyPayload,
        }),
      ).rejects.toThrow(
        "FCM multicast token count exceeds the maximum limit of 500 tokens.",
      );
    });

    it("harus mengumpulkan stale token dan menghapusnya di Prisma", async () => {
      // Mock respon FCM dengan 1 token sukses dan 1 token mati (stale)
      vi.mocked(fcm.sendEachForMulticast).mockResolvedValueOnce({
        successCount: 1,
        failureCount: 1,
        responses: [
          { success: true },
          {
            success: false,
            error: {
              code: "messaging/registration-token-not-registered",
              message: "Token expired",
              toJSON: () => ({}),
            },
          },
        ],
      });

      // Mock sukses Prisma deleteMany
      vi.mocked(prisma.user_device.deleteMany).mockResolvedValue({ count: 1 });

      const result = await PushNotificationService.sendNotificationMultiToken({
        idTokens: ["token_valid", "token_stale"],
        enTokens: [],
        payload: dummyPayload,
      });

      // Assertion hasil keluaran
      expect(result.success).toBe(true);
      expect(result.staleTokens).toEqual(["token_stale"]);

      // Assertion pemicu Prisma deleteMany
      expect(prisma.user_device.deleteMany).toHaveBeenCalledWith({
        where: { fcm_token: { in: ["token_stale"] } },
      });
    });

    it("harus memilih lokalisasi teks ID dan EN secara tepat", async () => {
      vi.mocked(fcm.sendEachForMulticast).mockResolvedValue({
        successCount: 1,
        failureCount: 0,
        responses: [{ success: true }],
      });

      await PushNotificationService.sendNotificationMultiToken({
        idTokens: ["id_token_1"],
        enTokens: ["en_token_1"],
        payload: dummyPayload,
      });

      expect(fcm.sendEachForMulticast).toHaveBeenCalledTimes(2);

      // Verifikasi panggilan pertama (Indonesian Payload)
      expect(fcm.sendEachForMulticast).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          tokens: ["id_token_1"],
          notification: { title: "Judul ID", body: "Pesan ID" },
        }),
      );

      // Verifikasi panggilan kedua (English Payload)
      expect(fcm.sendEachForMulticast).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          tokens: ["en_token_1"],
          notification: { title: "Title EN", body: "Body EN" },
        }),
      );
    });
  });

  describe("sendNotificationToTopic", () => {
    it("harus menyusun string condition FCM topic dengan benar beserta mfd opsional", async () => {
      vi.mocked(fcm.send).mockResolvedValue("msg_id_123");

      const success = await PushNotificationService.sendNotificationToTopic({
        topics: ["test-users"],
        mfd: "0000",
        payload: dummyPayload,
      });

      expect(success).toBe(true);
      expect(fcm.send).toHaveBeenCalledTimes(2);

      // Memastikan kondisi ID disusun dengan tepat
      expect(fcm.send).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          condition:
            "'test-users' in topics && 'lang_id' in topics && mfd_0000 in topics",
          notification: { title: "Judul ID", body: "Pesan ID" },
        }),
      );
    });

    it("harus mengembalikan false jika array topics kosong", async () => {
      const success = await PushNotificationService.sendNotificationToTopic({
        topics: [],
        payload: dummyPayload,
      });

      expect(success).toBe(false);
      expect(fcm.send).not.toHaveBeenCalled();
    });
  });
});
