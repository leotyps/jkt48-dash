import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Koneksi ke database CockroachDB
const pool = new Pool({
  connectionString:
    'postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newApiKey } = req.body;

  if (!userId || !newApiKey) {
    return res.status(400).json({ error: 'User ID and new API key are required' });
  }

  try {
    const client = await pool.connect();

    // Perbarui API key pengguna
    await client.query(
      'UPDATE api_keys SET api_key = $1 WHERE user_id = $2',
      [newApiKey, userId]
    );

    client.release();
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error updating API key:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
