import { NextApiRequest, NextApiResponse } from 'next';
import {
  AccessToken,
  API_ENDPOINT,
  CLIENT_ID,
  CLIENT_SECRET,
  setServerSession,
} from '@/utils/auth/github'; // Ganti impor ke file GitHub
import { i18n } from 'next.config';
import { z } from 'zod';
import { getAbsoluteUrl } from '@/utils/get-absolute-url';

// Fungsi untuk menukar kode OAuth2 dengan token akses GitHub
async function exchangeToken(code: string): Promise<AccessToken> {
  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: code,
    redirect_uri: `${getAbsoluteUrl()}/api/auth/callback-github`, // Pastikan URL callback sesuai
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(`https://github.com/login/oauth/access_token`, {
    headers,
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = await response.json();
    return {
      access_token: result.access_token,
      token_type: result.token_type,
      scope: result.scope,
    } as AccessToken;
  } else {
    throw new Error('Failed to exchange token');
  }
}

// Skema untuk validasi query parameter
const querySchema = z.object({
  code: z.string(),
  state: z
    .string()
    .optional()
    .transform((v) => {
      if (!i18n || !v) return undefined;
      return i18n.locales.find((locale) => locale === v);
    }),
});

// Handler untuk endpoint callback
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = querySchema.safeParse(req.query);

  if (!query.success) {
    return res.status(400).json('Invalid query param');
  }

  const { code, state } = query.data;

  try {
    // Tukar kode dengan token akses
    const token = await exchangeToken(code);

    // Simpan token di cookie
    setServerSession(req, res, token);

    // Redirect ke halaman yang sesuai
    res.redirect(state ? `/${state}/user/home` : `/user/home`);
  } catch (error) {
    console.error('Error during token exchange:', error);
    res.status(500).json('Internal Server Error');
  }
}
