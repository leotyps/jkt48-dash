import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { apiKey, limit, expiryDate } = req.body;

  if (!apiKey || !limit || !expiryDate) {
    res.status(400).json({ message: "Semua input wajib diisi!" });
    return;
  }

  const webhookUrl = "https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C"; // Ganti dengan URL webhook Discord Anda

  const payload = {
    content: "**Permintaan API Key Baru**",
    embeds: [
      {
        color: 3447003, // Warna embed (opsional)
        fields: [
          { name: "API Key", value: apiKey, inline: true },
          { name: "Limit", value: limit.toString(), inline: true },
          { name: "Masa Aktif", value: expiryDate, inline: true },
        ],
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    res.status(200).json({ message: "Pesan berhasil dikirim ke Discord." });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
      res.status(500).json({
        message: "Gagal mengirim pesan ke Discord.",
        error: (error as Error).message,
      });
    } else {
      res.status(500).json({
        message: "Gagal mengirim pesan ke Discord.",
        error: "Unknown error",
      });
    }
  }
}
