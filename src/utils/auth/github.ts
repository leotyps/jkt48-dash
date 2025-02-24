import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, deleteCookie } from 'cookies-next';
import { z } from 'zod';
import type { OptionsType } from 'cookies-next/lib/types';
import { NextRequest } from 'next/server';
import { IncomingMessage } from 'http';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

export const API_ENDPOINT = 'https://api.github.com';
export const CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? '';
export const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? '';
const TokenCookie = 'ts-token';
const ApiKeyCookie = 'jkt48-api-key';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C';

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  scope: z.string(),
});

const options: OptionsType = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30, // Cookie expired after 30 days
};

export type AccessToken = z.infer<typeof tokenSchema>;

export function getServerSession(req: NextApiRequest) {
  const raw = req.cookies[TokenCookie];
  return tokenSchema.safeParse(raw == null ? raw : JSON.parse(raw));
}

export function setServerSession(req: NextApiRequest, res: NextApiResponse, data: AccessToken) {
  setCookie(TokenCookie, JSON.stringify(data), { req, res, ...options });
}

export function middleware_hasServerSession(req: NextRequest) {
  const raw = req.cookies.get(TokenCookie)?.value;
  return raw != null && tokenSchema.safeParse(JSON.parse(raw)).success;
}

export async function removeSession(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (session.success) {
    deleteCookie(TokenCookie, { req, res, ...options });
    await revokeToken(session.data.access_token);
  }
}

async function revokeToken(accessToken: string) {
  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    access_token: accessToken,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  await fetch(`https://api.github.com/applications/${CLIENT_ID}/token`, {
    headers,
    body: JSON.stringify(data),
    method: 'DELETE',
  });
}

function generateApiKey() {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `JC-${randomPart}`;
}

export async function getOrCreateApiKey(req: NextApiRequest, res: NextApiResponse) {
  let apiKey = req.cookies[ApiKeyCookie];

  if (!apiKey) {
    apiKey = generateApiKey();
    setCookie(ApiKeyCookie, apiKey, { req, res, ...options });
    await sendWebhookNotification(apiKey);
  }

  return apiKey;
}

async function sendWebhookNotification(apiKey: string) {
  const payload = {
    content: `🔔 **New API Key Generated**\nAPI Key: \`${apiKey}\``,
  };

  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function initializeApiKeyInClient() {
  if (typeof window !== 'undefined') {
    const existingKey = localStorage.getItem('jkt48-api-key');
    if (!existingKey) {
      fetch('/api/auth/get-api-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) {
            localStorage.setItem('jkt48-api-key', data.apiKey);
          }
        })
        .catch((err) => console.error('Failed to fetch API key:', err));
    }
  }
}
