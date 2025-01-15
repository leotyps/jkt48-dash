import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, apiKey } = req.body;

  if (!userId || !apiKey) {
    return res.status(400).json({ message: 'User ID and API Key are required' });
  }

  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO api_keys (user_id, api_key, last_access_date)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET api_key = $2, last_access_date = NOW()`,
      [userId, apiKey]
    );
    client.release();

    res.status(200).json({ message: 'API key saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}
