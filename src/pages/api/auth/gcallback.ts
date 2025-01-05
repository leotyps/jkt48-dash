import { NextApiRequest, NextApiResponse } from 'next';
import { auth as firebaseAuth } from '@/config/firebaseConfig';
import { getAbsoluteUrl } from '@/utils/get-absolute-url';
import { setServerSession } from '@/utils/auth/server';
import { getRedirectResult } from 'firebase/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mengambil hasil redirect dari Firebase
    const result = await getRedirectResult(firebaseAuth);

    if (result) {
      const user = result.user;

      // Dapatkan token ID pengguna
      const idToken = await user.getIdToken();
      const userSession = {
        access_token: idToken,
        token_type: 'Bearer' as const,  // Pastikan ini adalah string literal 'Bearer'
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email',
      };

      // Simpan sesi di server
      await setServerSession(req, res, userSession);

      // Redirect ke halaman home setelah login
      res.redirect('/user/home');  // Ubah dengan URL yang sesuai
    } else {
      res.status(400).json({ error: 'Google login failed' });
    }
  } catch (error) {
    console.error('Error handling Google login callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
