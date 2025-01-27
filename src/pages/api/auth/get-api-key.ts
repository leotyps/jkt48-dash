import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database
import { getOrCreateApiKey } from '@/utils/auth/server'; // Fungsi untuk membuat/mendapatkan API key

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Dapatkan atau buat API key
    const apiKey = await getOrCreateApiKey(req, res);

    // Ambil parameter user dari query
    const { id, username, balance } = req.query;

    if (!id || !username) {
      return res.status(400).json({ error: 'Missing required fields: id or username' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();
    const query = `
      INSERT INTO users (id, username, api_key, balance)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING;
    `;
    const values = [id, username, apiKey, balance || 0]; // Default balance ke 0 jika tidak ada
    await db.query(query, values);

    // Kembalikan API key dan pesan sukses
    res.status(200).json({ message: 'User data saved successfully', apiKey });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
