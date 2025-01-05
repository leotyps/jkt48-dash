// ./pages/api/auth/setSession.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { setServerSession } from '@/utils/auth/googleServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { access_token, refresh_token, expires_in } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // Simpan sesi
    const session = {
      access_token,
      refresh_token,
      expires_in,
      token_type: 'Bearer',
    };

    await setServerSession(req, res, session);

    res.status(200).json({ message: 'Session saved successfully' });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
