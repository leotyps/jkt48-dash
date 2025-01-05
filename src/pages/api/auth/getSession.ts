// ./pages/api/auth/getSession.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/config/firebaseAdmin'; // Pastikan Firebase Admin SDK dikonfigurasi

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token missing or invalid' });
    }

    const idToken = authorization.split('Bearer ')[1];

    // Verifikasi ID Token menggunakan Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Jika valid, kirimkan data session ke klien
    res.status(200).json({ user: decodedToken });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid session or token' });
  }
}
