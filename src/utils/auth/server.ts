// utils/auth/server.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, deleteCookie } from 'cookies-next'; // Pastikan menggunakan cookies-next
import { z } from 'zod';
import type { OptionsType } from 'cookies-next/lib/types';
// utils/auth/server.ts
import { NextRequest } from 'next/server';
import { IncomingMessage } from 'http';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

// Fungsi untuk mendapatkan sesi
export function getServerSession(req: NextApiRequest) {
  const raw = req.cookies[TokenCookie];
  return tokenSchema.safeParse(raw == null ? raw : JSON.parse(raw));
}
export const API_ENDPOINT = 'https://discord.com/api/v10';
export const CLIENT_ID = process.env.BOT_CLIENT_ID ?? '';
export const CLIENT_SECRET = process.env.BOT_CLIENT_SECRET ?? '';

const TokenCookie = 'ts-token';

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


export const setServerSession = async (req: NextApiRequest, res: NextApiResponse, token: AccessToken) => {
  // Menyimpan sesi di cookie atau session sesuai kebutuhan
  // Misalnya menggunakan cookie
  res.setHeader('Set-Cookie', `token=${token.access_token}; Path=/; HttpOnly; Max-Age=${token.expires_in}`);
};

export function middleware_hasServerSession(req: NextRequest) {
  const raw = req.cookies.get(TokenCookie)?.value;

  return raw != null && tokenSchema.safeParse(JSON.parse(raw)).success;
}


// Fungsi untuk menghapus sesi
export async function removeSession(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (session.success) {
    deleteCookie(TokenCookie, { req, res, ...options });
    // Revoke the token if necessary
    await revokeToken(session.data.access_token);
  }
}

async function revokeToken(accessToken: string) {
  const data = {
    client_id: process.env.BOT_CLIENT_ID ?? '',
    client_secret: process.env.BOT_CLIENT_SECRET ?? '',
    token: accessToken,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  await fetch(`https://discord.com/api/oauth2/token/revoke`, {
    headers,
    body: new URLSearchParams(data),
    method: 'POST',
  });
}
