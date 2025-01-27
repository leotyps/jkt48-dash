import { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateApiKey } from '@/utils/auth/server';
import { useSelfUser } from '@/api/hooks';  // Menggunakan hooks untuk mendapatkan data user
import { connectToDatabase } from '@/utils/db'; // Koneksi ke CockroachDB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mengambil API key
    const apiKey = await getOrCreateApiKey(req, res);

    // Mendapatkan data user langsung menggunakan useSelfUser
    const user = useSelfUser();
    if (!user || !user.id || !user.username) {
      return res.status(400).json({ error: "User data is missing or invalid." });
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

    // Menyusun URL avatar dan banner jika ada
    const avatar = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=512` : null;
    const banner = user.banner ? `https://cdn.discordapp.com/banners/${user.id}/${user.banner}?size=1024` : null;

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
