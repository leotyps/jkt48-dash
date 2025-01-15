import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Konfigurasi koneksi database
const pool = new Pool({
  connectionString:
    'postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full',
});

// Fungsi untuk mendapatkan tanggal format DD/MM/YYYY/HH:mm dengan penambahan hari
const getFormattedDate = (daysToAdd: number): string => {
  const now = new Date();
  now.setDate(now.getDate() + daysToAdd);

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}/${hours}:${minutes}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const randomString = uuidv4().split('-')[0].toUpperCase();
  const apiKey = `CN-${randomString}`;
  const expiryDate = getFormattedDate(7); // Masa berlaku 7 hari
  const maxRequests = 25; // Maksimal 25 permintaan
  const seller = false; // Default bukan seller

  try {
    const client = await pool.connect();

    // Periksa apakah pengguna sudah memiliki API key
    const { rows } = await client.query(
      `SELECT * FROM api_keys WHERE user_id = $1`,
      [userId]
    );

    if (rows.length === 0) {
      // Tambahkan API key baru jika belum ada
      await client.query(
        `INSERT INTO api_keys (user_id, api_key, expiry_date, remaining_requests, max_requests, last_access_date, seller) 
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [userId, apiKey, expiryDate, maxRequests, maxRequests, seller]
      );
      console.log('API key created for user:', userId);
    } else {
      console.log('User already has an API key:', userId);
    }

    client.release();
    res.status(200).json({ success: true, apiKey });
  } catch (err) {
    console.error('Error creating API key:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
