// pages/api/save-user-data.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db'; // Koneksi ke database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { team_id, saldo = 0, apikey = null } = req.query;

    if (!team_id) {
      return res.status(400).json({ error: 'team_id is required' });
    }

    const db = await connectToDatabase();
    const query = `
      INSERT INTO pengguna (team_id, saldo, apikey)
      VALUES ($1, $2, $3)
      ON CONFLICT (team_id) DO NOTHING;
    `;
    const values = [team_id, saldo, apikey];
    await db.query(query, values);

    res.status(200).json({ message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
