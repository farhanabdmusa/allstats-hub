"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenerateContentResponse, GoogleGenAI, Type } from "@google/genai";

// Lazy load Gemini AI to avoid crashes if API key is not present on startup
let defaultAIInstance: GoogleGenAI | null = null;

function getAI(customApiKey?: string): GoogleGenAI {
  if (customApiKey) {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  if (!defaultAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not defined. Please add your Gemini API key in Settings > Secrets or enter your own API Key in the settings.",
      );
    }
    defaultAIInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return defaultAIInstance;
}

const generateNotification = async (context: string, customApiKey?: string) => {
  const ai = getAI(customApiKey);

  const prompt = `
Anda adalah seorang expert copywriter yang sangat mahir membuat konten iklan kreatif dan memahami tren serta "hype" terbaru (trendjacking) yang sedang berlangsung di Indonesia akhir-akhir ini (baik dari media sosial, meme, pop culture, maupun tren bahasa).

Tolong buatkan saya konten iklan untuk campaign berikut:

${context}

Konteks Target Audience:
Masyarakat luas pengguna data statistik Badan Pusat Statistik (BPS). Target audience ini sangat heterogen/beragam, mencakup:
- Pemerintah (penentu kebijakan, ASN/birokrat)
- Akademisi & Peneliti (dosen, pengamat ekonomi/sosial)
- Pelajar & Mahasiswa (untuk tugas akhir, lomba, atau riset kuliah)
- Pengusaha & Pelaku Bisnis (untuk analisis pasar, peluang investasi, dan ekspansi)
- Masyarakat Umum (yang membutuhkan informasi tepercaya)

Oleh karena itu, konten iklan harus bisa menjangkau dan relevan bagi berbagai kalangan tersebut sesuai dengan tipe penyampaian bahasanya.

Ketentuan Output:
1. Sediakan 4 tipe penyampaian bahasa (tone of voice):
   - "professional" (Formal, meyakinkan, edukatif - cocok untuk Pemerintah/Akademisi)
   - "friendly_casual" (Santai, akrab, informatif - cocok untuk Pengusaha/Masyarakat Umum)
   - "hype_trendy" (Menggunakan tren/slang/meme yang sedang viral di Indonesia saat ini - cocok untuk Pelajar/Mahasiswa)
   - "persuasive_emotional" (Menyentuh pentingnya data akurat sebagai solusi dari sebuah masalah/pain points)

2. Untuk setiap tipe penyampaian bahasa, sediakan konten dalam format:
   - Title (Judul Iklan)
     * KETENTUAN KHUSUS TITLE: panjangnya MAKSIMAL 50 karakter, boleh menggunakan emoji yang relevan.
   - Description (Deskripsi/Body Copy Iklan)
   - Short Description: Konten khusus untuk PUSH NOTIFICATION di ponsel pengguna. 
     * KETENTUAN KHUSUS SHORT DESCRIPTION: Wajib menggunakan gaya penulisan yang memicu rasa penasaran (curiosity gap), langsung ke inti (punchy), menggunakan emoji yang relevan, dan panjangnya MAKSIMAL 100 karakter (termasuk spasi dan emoji) agar tidak terpotong di layar ponsel.

3. Setiap tipe penyampaian wajib disajikan dalam 2 versi bahasa:
   - "id" (Bahasa Indonesia)
   - "en" (Bahasa Inggris)

4. Output WAJIB berupa JSON Array yang valid, tanpa ada teks penjelasan lain di luar JSON.

Format JSON yang diharapkan untuk setiap tone of voice:
{
    "type": "[Tone of Voice]",
    "id_title": "[Judul versi Bahasa Indonesia]",
    "id_description": "[Deskripsi versi Bahasa Indonesia]",
    "id_short_description": "[Short Deskripsi versi Bahasa Indonesia]",
    "en_title": "[Title in English]",
    "en_description": "[Description in English]",
    "en_short_description": "[Short Description in English]",
}
`;

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro",
    "gemini-3.5-flash",
  ];
  let lastError: any = null;
  let response: GenerateContentResponse | null = null;

  for (const modelName of modelsToTry) {
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                model: { type: Type.STRING },
                type: { type: Type.STRING },
                id_title: { type: Type.STRING },
                id_description: { type: Type.STRING },
                id_short_description: { type: Type.STRING },
                en_title: { type: Type.STRING },
                en_description: { type: Type.STRING },
                en_short_description: { type: Type.STRING },
              },
              required: [
                "type",
                "id_title",
                "id_description",
                "id_short_description",
                "en_title",
                "en_description",
                "en_short_description",
              ],
            },
          },
        },
      });
      if (response && response.text) {
        break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!response || !response.text) {
    throw new Error(
      `Gagal mendapatkan respons dari Gemini AI setelah mencoba beberapa model. Error terakhir: ${
        lastError?.message || JSON.stringify(lastError)
      }`,
    );
  }

  const data = {
    model: response.modelVersion,
    data: JSON.parse(response.text),
  };

  return data;
};

export { generateNotification };
