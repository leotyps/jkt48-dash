// api/auth/add-balance.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil phone_number dan amount dari body request
    const { phone_number, amount } = req.body;

    if (!phone_number || !amount) {
      return res.status(400).json({ error: 'Missing required fields: phone_number and amount' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than zero' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Periksa apakah pengguna ada
    const checkUserQuery = `SELECT id, balance FROM users WHERE phone_number = $1;`;
    const checkUserResult = await db.query(checkUserQuery, [phone_number]);

    if (checkUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Tambahkan balance ke pengguna
    const updateQuery = `
      UPDATE users
      SET balance = balance + $1
      WHERE phone_number = $2
      RETURNING balance;
    `;
    const updateResult = await db.query(updateQuery, [amount, phone_number]);

    res.status(200).json({ message: 'Balance updated successfully', balance: updateResult.rows[0].balance });

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
