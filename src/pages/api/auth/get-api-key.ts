import { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateApiKey } from '@/utils/auth/server';
import { avatarUrl, bannerUrl } from '@/api/discord'; // Import untuk membentuk URL gambar
import { connectToDatabase } from '@/utils/db'; // Koneksi ke CockroachDB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mengambil API key
    const apiKey = await getOrCreateApiKey(req, res);

    // Mengambil user.id dan user.username dari request body atau query (misalnya, sebagai input langsung)
    const { userId, username, banner } = req.body; // Atau menggunakan req.query jika mengirimkan data via query string

    // Validasi input
    if (!userId || !username) {
      return res.status(400).json({ error: "User ID and Username are required." });
    }

    const initialBalance = 0; // Saldo awal

    // Menyimpan data pengguna ke CockroachDB
    const db = await connectToDatabase();
    const query = `
      INSERT INTO users (id, username, api_key, balance)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING;
    `;
    const values = [userId, username, apiKey, initialBalance];
    await db.query(query, values);

    // Menyusun URL avatar dan banner
    const avatar = avatarUrl({ id: userId, avatar: '', username } as any); // Menggunakan dummy value untuk avatar
    const userBanner = banner ? bannerUrl(userId, banner) : null;

    // Memberikan response ke client
    res.status(200).json({
      apiKey,
      id: userId,
      username,
      balance: initialBalance,
      avatarUrl: avatar,
      bannerUrl: userBanner,
    });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
