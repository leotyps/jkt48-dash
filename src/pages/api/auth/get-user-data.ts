// api/auth/get-user-data.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil parameter id dari query
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Query untuk mengambil data berdasarkan id
    const query = `
      SELECT id, username, api_key, balance
      FROM users
      WHERE id = $1;
    `;
    const values = [id];
    const result = await db.query(query, values);

    // Jika data tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kembalikan data user
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
