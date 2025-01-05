import { NextApiRequest, NextApiResponse } from 'next';
import { auth as firebaseAuth } from '@/config/firebaseConfig'; // Pastikan Firebase sudah dikonfigurasi dengan benar
import { setServerSession } from '@/utils/auth/server';
import { getRedirectResult } from 'firebase/auth'; // Import Firebase Auth SDK untuk redirect result
import { getAbsoluteUrl } from '@/utils/get-absolute-url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Mengambil hasil redirect dari Firebase (setelah login menggunakan Google)
    const result = await getRedirectResult(firebaseAuth);

    if (result) {
      const user = result.user;

      // Dapatkan token ID pengguna
      const idToken = await user.getIdToken();
      const userSession = {
        access_token: idToken,
        token_type: 'Bearer' as const,  // Pastikan token_type adalah 'Bearer'
        expires_in: 3600,
        refresh_token: user.refreshToken,
        scope: 'email',
      };

      // Simpan sesi di server (misalnya menggunakan cookie atau session)
      await setServerSession(req, res, userSession);

      // Redirect ke halaman home setelah login
      res.redirect('/user/home');  // Ubah dengan URL yang sesuai dengan aplikasi Anda
    } else {
      res.status(400).json({ error: 'Google login failed' });
    }
  } catch (error) {
    console.error('Error handling Google login callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
