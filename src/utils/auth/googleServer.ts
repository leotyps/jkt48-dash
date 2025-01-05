import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, deleteCookie } from 'cookies-next'; // Pastikan menggunakan cookies-next
import { z } from 'zod';
import type { OptionsType } from 'cookies-next/lib/types';
import { NextRequest } from 'next/server';

// Definisikan token session untuk Google
const TokenCookie = 'google-token';

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

const options: OptionsType = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30, // Cookie expired after 30 days
};

export type AccessToken = z.infer<typeof tokenSchema>;

// Fungsi untuk mendapatkan sesi
export function getServerSession(req: NextApiRequest) {
  const raw = req.cookies[TokenCookie];
  return tokenSchema.safeParse(raw == null ? raw : JSON.parse(raw));
}

// Fungsi untuk menyimpan sesi di cookie
export function setServerSession(req: NextApiRequest, res: NextApiResponse, data: AccessToken) {
  setCookie(TokenCookie, JSON.stringify(data), { req, res, ...options });
}

 function middleware_hasGoogleServerSession(req: NextRequest) {
  const raw = req.cookies.get('google-token')?.value;  // Misalnya, menggunakan cookie untuk token Google

  // Proses token sesuai dengan skema yang Anda butuhkan
  return raw != null && googleTokenSchema.safeParse(JSON.parse(raw)).success;
}

// Fungsi untuk menghapus sesi
export async function removeSession(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (session.success) {
    deleteCookie(TokenCookie, { req, res, ...options });
    // Token dapat di-revoke jika diperlukan
    await revokeToken(session.data.access_token);
  }
}

// Fungsi untuk melakukan revoke token di Google
async function revokeToken(accessToken: string) {
  const data = {
    token: accessToken,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  await fetch('https://oauth2.googleapis.com/revoke', {
    headers,
    body: new URLSearchParams(data),
    method: 'POST',
  });
}
