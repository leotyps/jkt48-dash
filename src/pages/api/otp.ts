// pages/api/otp.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db2'; // Koneksi ke database MongoDB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("otps");

    if (req.method === "POST") {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: "Missing phone or OTP" });
      }

      // Simpan OTP ke MongoDB dengan TTL 5 menit (300 detik)
      await collection.insertOne({
        phone,
        otp,
        createdAt: new Date(),
      });

      return res.status(200).json({ message: "OTP saved successfully" });
    }

    if (req.method === "GET") {
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({ error: "Missing phone number" });
      }

      // Ambil OTP berdasarkan nomor
      const otpData = await collection.findOne({ phone });

      if (!otpData) {
        return res.status(404).json({ error: "OTP not found" });
      }

      // Hapus OTP setelah diambil
      await collection.deleteOne({ phone });

      return res.status(200).json({ phone, otp: otpData.otp });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("🔴 Error handling OTP:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
