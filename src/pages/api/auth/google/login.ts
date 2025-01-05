// pages/api/auth/google/login.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from '@/utils/auth/server';  // Sesuaikan dengan utilitas autentikasi server
import { signIn } from 'next-auth/react';  // Jika menggunakan NextAuth untuk autentikasi

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { locale } = req.query;

  // Pastikan ada session aktif sebelum login
  const session = getServerSession(req);

  if (session?.success) {
    return res.redirect('/user/home');  // Jika sudah login, arahkan ke home
  }

  if (req.method === 'GET') {
    // Mengarahkan pengguna untuk login dengan Google
    await signIn('google', { callbackUrl: '/user/home' });  // Sesuaikan URL callback
    return res.status(302).end();  // Redirect otomatis setelah login
  }

  res.status(405).end();  // Method Not Allowed
}
