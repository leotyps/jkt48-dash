import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil phone_number dan status dari query parameter
    const { phone_number, status } = req.query;

    if (!phone_number || !status) {
      return res.status(400).json({ error: 'Missing required fields: phone_number and status' });
    }

    // Konversi status ke boolean (hanya boleh 'true' atau 'false')
    const newStatus = status === 'true' ? true : status === 'false' ? false : null;
    if (newStatus === null) {
      return res.status(400).json({ error: 'Invalid status value, must be "true" or "false"' });
    }

    // Koneksi ke database
    const db = await connectToDatabase();

    // Periksa apakah pengguna ada
    const checkUserQuery = `SELECT id, is_premium FROM users WHERE phone_number = $1;`;
    const checkUserResult = await db.query(checkUserQuery, [phone_number]);

    if (checkUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let currentStatus = checkUserResult.rows[0].is_premium;

    // Jika status tidak berubah, langsung return
    if (currentStatus === newStatus) {
      return res.status(200).json({ message: 'No changes made, status is already set', is_premium: currentStatus });
    }

    // Update status premium pengguna
    const updateQuery = `
      UPDATE users
      SET is_premium = $1
      WHERE phone_number = $2
      RETURNING is_premium;
    `;
    const updateResult = await db.query(updateQuery, [newStatus, phone_number]);

    res.status(200).json({
      message: 'Premium status updated successfully',
      phone_number,
      previous_status: currentStatus,
      new_status: updateResult.rows[0].is_premium
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
