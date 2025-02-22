import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil phone_number, id, dan amount dari query parameter
    const { phone_number, id, amount } = req.query;

    if ((!phone_number && !id) || !amount) {
      return res.status(400).json({ error: 'Missing required fields: provide either phone_number or id, and amount' });
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid number greater than zero' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Periksa apakah pengguna ada berdasarkan phone_number atau id
    let userQuery = `SELECT id, balance FROM users WHERE `;
    let userParam;

    if (id) {
      userQuery += `id = $1`;
      userParam = [id];
    } else {
      userQuery += `phone_number = $1`;
      userParam = [phone_number];
    }

    const checkUserResult = await db.query(userQuery, userParam);

    if (checkUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Tambahkan balance ke pengguna
    const updateQuery = `
      UPDATE users
      SET balance = balance + $1
      WHERE id = $2
      RETURNING balance;
    `;
    const updateResult = await db.query(updateQuery, [amountNumber, checkUserResult.rows[0].id]);

    res.status(200).json({ message: 'Balance updated successfully', balance: updateResult.rows[0].balance });

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
