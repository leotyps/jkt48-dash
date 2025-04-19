// api/auth/get-user-data.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil parameter team_id dari query
    const { team_id } = req.query;

    if (!team_id) {
      return res.status(400).json({ error: 'Missing required field: team_id' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Query untuk mengambil data berdasarkan team_id
    const query = `
      SELECT team_id, saldo, apikey, phone_number
      FROM pengguna
      WHERE team_id = $1;
    `;
    const values = [team_id];
    const result = await db.query(query, values);

    // Jika data tidak ditemukan
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kembalikan data pengguna
    res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
