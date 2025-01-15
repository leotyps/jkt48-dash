import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { getSession } from 'next-auth/react';

// Konfigurasi koneksi database
const pool = new Pool({
  connectionString:
    'postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      const { rows } = await client.query('SELECT api_key FROM api_keys WHERE user_id = $1', [userId]);

      client.release();

      if (rows.length > 0) {
        return res.status(200).json({ apiKey: rows[0].api_key });
      } else {
        return res.status(404).json({ error: 'API Key not found' });
      }
    } catch (error) {
      console.error('Error fetching API Key:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key is required' });
    }

    try {
      const client = await pool.connect();
      
      // Perbarui API Key jika sudah ada, atau tambahkan yang baru
      const { rowCount } = await client.query('SELECT * FROM api_keys WHERE user_id = $1', [userId]);

      if (rowCount > 0) {
        // Update API Key yang sudah ada
        await client.query('UPDATE api_keys SET api_key = $1 WHERE user_id = $2', [apiKey, userId]);
      } else {
        // Insert API Key baru jika belum ada
        await client.query('INSERT INTO api_keys (user_id, api_key) VALUES ($1, $2)', [userId, apiKey]);
      }

      client.release();

      return res.status(200).json({ success: true, apiKey });
    } catch (error) {
      console.error('Error updating API Key:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
