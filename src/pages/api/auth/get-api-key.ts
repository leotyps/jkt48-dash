import { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateApiKey } from '@/utils/auth/server';
import { fetchUserInfo, avatarUrl, bannerUrl } from '@/api/discord'; // Import sesuai struktur Anda
import { connectToDatabase } from '@/utils/db'; // Koneksi ke CockroachDB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mengambil API key
    const apiKey = await getOrCreateApiKey(req, res);

    // Mendapatkan informasi pengguna dari Discord API
    const token = req.headers.authorization?.split(" ")[1]; // Token dari header
    if (!token) {
      return res.status(400).json({ error: "Authorization token is missing." });
    }

    const user = await fetchUserInfo(token);
    if (!user) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    const userId = user.id;
    const username = user.username;
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
    const avatar = avatarUrl(user);
    const banner = user.banner ? bannerUrl(user.id, user.banner) : null;

    // Memberikan response ke client
    res.status(200).json({
      apiKey,
      id: userId,
      username,
      balance: initialBalance,
      avatarUrl: avatar,
      bannerUrl: banner,
    });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
