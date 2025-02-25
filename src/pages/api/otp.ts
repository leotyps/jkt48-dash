import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/utils/db2";

/**
 * Fungsi untuk generate OTP dengan tepat 6 digit
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Selalu 6 digit
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = await connectToDatabase();

    if (req.method === "POST") {
      // Simpan OTP baru
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: "Nomor telepon wajib diisi" });
      }

      // Generate OTP baru dengan 6 digit
      const newOtp = generateOTP();

      // Simpan OTP ke database (nomor yang sama bisa memiliki OTP berbeda)
      await db.query(
        `INSERT INTO otps (phone, otp, created_at) VALUES ($1, $2, NOW())`,
        [phone, newOtp]
      );

      console.log(`✅ OTP ${newOtp} untuk nomor ${phone} disimpan.`);

      // Jadwalkan penghapusan otomatis setelah 5 menit
      setTimeout(async () => {
        await db.query(`DELETE FROM otps WHERE phone = $1 AND otp = $2`, [phone, newOtp]);
        console.log(`🗑️ OTP ${newOtp} untuk nomor ${phone} telah dihapus.`);
      }, 5 * 60 * 1000); // 5 menit dalam milidetik

      return res.status(200).json({ message: "OTP berhasil dibuat", phone, otp: newOtp });
    }

    if (req.method === "GET") {
      // Ambil semua OTP yang masih aktif
      const { rows: allOtps } = await db.query(`SELECT * FROM otps`);

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
