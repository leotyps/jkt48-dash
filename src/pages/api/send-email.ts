import type { NextApiRequest, NextApiResponse } from "next";
import { nodemailer } from "nodemailer";

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

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "support@jkt48connect.my.id", // Replace with your email
      pass: "your-password", // Replace with your password or app password
    },
  });

  try {
    await transporter.sendMail({
      from: "support@jkt48connect.my.id",
      to: "support@jkt48connect.my.id",
      subject: "Permintaan API Key Baru",
      text: `
        Permintaan API Key Baru:
        - API Key: ${apiKey}
        - Limit: ${limit}
        - Masa Aktif: ${expiryDate}
      `,
    });

    res.status(200).json({ message: "Email berhasil dikirim." });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengirim email." });
  }
}
