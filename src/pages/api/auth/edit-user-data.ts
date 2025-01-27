// pages/api/edit-user-data.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, apiKey } = req.query;

    if (!id || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await connectToDatabase();
    
    // Query untuk memperbarui apiKey berdasarkan id
    const query = `
      UPDATE users
      SET api_key = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [apiKey, id];
    
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User ID not found' });
    }

    res.status(200).json({ message: 'User data updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
