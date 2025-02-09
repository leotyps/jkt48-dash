import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Handler untuk API Route Next.js
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ambil query parameter "text" atau gunakan default "hallo"
  const query = req.query.text ? String(req.query.text) : "hallo";

  try {
    // Ambil data dari API eksternal
    const response = await axios.get(`https://api.yanzbotz.live/api/ai/gpt4`, {
      params: {
        query: query,
        system: `Namamu Zenova, asisten buat bantu pengguna pake Zenova di WhatsApp.
        Penciptamu JKT48Connect Corp, dibuat sama Valzyy. Zenova punya 1000+ fitur,
        termasuk "brat" & fitur baru "Live Notifications JKT48". Jawab santai & siap bantu.`,
        apiKey: process.env.YANZBOTZ_API_KEY, // Gunakan API Key dari .env
      },
    });

    // Salin data respons API
    const responseData = { ...response.data };

    // Hapus properti "developer" dan "status" jika ada
    delete responseData.developer;
    delete responseData.status;

    // Kirimkan respons API yang telah difilter ke klien
    res.status(200).json(responseData);
  } catch (error: any) {
    console.error(`Error fetching data for query "${query}":`, error.message);

    res.status(500).json({
      success: false,
      message: `Gagal mengambil data untuk query "${query}".`,
      error: error.message,
    });
  }
}
