import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil phone_number dan amount dari query parameter
    const { phone_number, amount } = req.query;

    if (!phone_number || !amount) {
      return res.status(400).json({ error: 'Missing required fields: phone_number and amount' });
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid number greater than zero' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Periksa apakah pengguna ada dan dapatkan saldo saat ini
    const checkUserQuery = `SELECT id, balance FROM users WHERE phone_number = $1;`;
    const checkUserResult = await db.query(checkUserQuery, [phone_number]);

    if (checkUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let currentBalance = parseInt(checkUserResult.rows[0].balance);

    // Pastikan saldo cukup sebelum dikurangi
    if (currentBalance < amountNumber) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Kurangi saldo pengguna
    const updateQuery = `
      UPDATE users
      SET balance = balance - $1
      WHERE phone_number = $2
      RETURNING balance;
    `;
    const updateResult = await db.query(updateQuery, [amountNumber, phone_number]);

    res.status(200).json({
      message: 'Balance deducted successfully',
      balance_before: currentBalance,
      balance_after: updateResult.rows[0].balance,
      deducted_amount: amountNumber
    });

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
