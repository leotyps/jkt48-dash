import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ambil parameter phone_number dari query
    const { phone_number } = req.query;

    // Koneksi ke database
    const db = await connectToDatabase();

    let query: string;
    let values: any[] = [];
    let result;

    // Jika phone_number disediakan, ambil user spesifik
    if (phone_number) {
      query = `
        SELECT id, username, api_key, balance, seller, created_at, is_premium, phone_number
        FROM users
        WHERE phone_number = $1;
      `;
      values = [phone_number];
      result = await db.query(query, values);

      // Jika data tidak ditemukan
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];

      // Jika saldo kurang dari 0, tidak boleh digunakan
      if (user.balance < 0) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Kembalikan data user spesifik
      return res.status(200).json({ user });
    } else {
      // Jika phone_number tidak disediakan, ambil semua users
      query = `
        SELECT id, username, api_key, balance, seller, created_at, is_premium, phone_number
        FROM users;
      `;
      result = await db.query(query);

      // Kembalikan semua data users
      return res.status(200).json({ users: result.rows });
    }

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
