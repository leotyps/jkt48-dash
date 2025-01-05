// ./pages/api/auth/setSession.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { setServerSession } from '@/utils/auth/googleServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { access_token, refresh_token, expires_in, scope = 'email' } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Simpan sesi dengan properti lengkap
    const session = {
      access_token,
      refresh_token,
      expires_in: Number(expires_in), // Pastikan tipe data sesuai
      token_type: 'Bearer' as const, // Tetapkan tipe tetap 'Bearer'
      scope, // Tambahkan scope (default ke 'email' jika tidak ada)
    };

    await setServerSession(req, res, session);

    res.status(200).json({ message: 'Session saved successfully' });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
