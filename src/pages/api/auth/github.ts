import { NextApiRequest, NextApiResponse } from 'next';
import { CLIENT_ID } from '@/utils/auth/github'; // Ganti impor ke file GitHub
import { getAbsoluteUrl } from '@/utils/get-absolute-url';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { locale } = req.query as {
    locale?: string;
  };

  // Buat URL untuk otorisasi GitHub
  const url =
    'https://github.com/login/oauth/authorize?' +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: `${getAbsoluteUrl()}/api/auth/callback`, // Pastikan URL callback sesuai
      response_type: 'code',
      scope: 'user user:email', // Scope untuk akses profil, username, dan email
      state: locale ?? '', // Gunakan locale sebagai state
    });

  // Redirect ke URL otorisasi GitHub
  res.redirect(302, url);
}
