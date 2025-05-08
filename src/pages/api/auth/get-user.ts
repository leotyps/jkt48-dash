import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil parameter dari query (team_id atau phone_number)
    const { team_id, phone_number } = req.query;

    // Periksa apakah minimal salah satu parameter disediakan
    if (!team_id && !phone_number) {
      return res.status(400).json({ error: 'Missing required field: provide either team_id or phone_number' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    let query: string;
    let values: any[];

    // Tentukan query berdasarkan parameter yang diberikan
    if (team_id) {
      query = `
        SELECT team_id, saldo, apikey, phone_number
        FROM zenova
        WHERE team_id = $1;
      `;
      values = [team_id];
    } else {
      query = `
        SELECT team_id, saldo, apikey, phone_number
        FROM zenova
        WHERE phone_number = $1;
      `;
      values = [phone_number];
    }

    // Eksekusi query
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
