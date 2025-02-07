import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, phoneNumber } = req.query;

    // Validasi untuk memastikan id dan phoneNumber ada di dalam query
    if (!id || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await connectToDatabase();
    
    // Query untuk memperbarui phone_number berdasarkan id
    const query = `
      UPDATE users
      SET phone_number = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [phoneNumber, id];
    
    const result = await db.query(query, values);

    // Jika id pengguna tidak ditemukan
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User ID not found' });
    }

    // Mengembalikan response jika update berhasil
    res.status(200).json({ message: 'Phone number updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
