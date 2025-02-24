import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();
    const otpCollection = db.collection("otps");

    if (req.method === "POST") {
      // Simpan OTP
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ error: "Nomor telepon dan OTP wajib diisi" });
      }

      // Simpan OTP ke database dengan waktu penyimpanan
      await otpCollection.insertOne({
        phone,
        otp,
        createdAt: new Date(),
      });

      console.log(`✅ OTP ${otp} untuk nomor ${phone} disimpan.`);

      // Jadwalkan penghapusan otomatis setelah 5 menit
      setTimeout(async () => {
        await otpCollection.deleteOne({ phone });
        console.log(`🗑️ OTP ${otp} untuk nomor ${phone} telah dihapus.`);
      }, 5 * 60 * 1000); // 5 menit dalam milidetik

      return res.status(200).json({ message: "OTP berhasil disimpan" });
    }

    if (req.method === "GET") {
      // Ambil semua OTP yang tersedia
      const allOtps = await otpCollection.find({}).toArray();

      if (allOtps.length === 0) {
        return res.status(404).json({ error: "Tidak ada OTP yang tersedia" });
      }

      console.log(`🔹 Menampilkan semua OTP yang tersimpan (${allOtps.length} data).`);

      return res.status(200).json({ otps: allOtps });
    }

    res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("❌ Error OTP Handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
