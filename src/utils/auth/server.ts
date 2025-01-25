import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie, deleteCookie } from 'cookies-next';
import { z } from 'zod';
import { OptionsType } from 'cookies-next/lib/types';
import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

const TokenCookie = 'ts-token';
const ApiKeyCookie = 'ts-apikey';
export const API_ENDPOINT = 'https://discord.com/api/v10';
export const CLIENT_ID = process.env.BOT_CLIENT_ID ?? '';
export const CLIENT_SECRET = process.env.BOT_CLIENT_SECRET ?? '';
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C';

const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

const options: OptionsType = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export type AccessToken = z.infer<typeof tokenSchema>;

// Generate a random API key
function generateApiKey(): string {
  const randomPart = randomBytes(3).toString('hex').toUpperCase(); // 6 characters
  return `JC-${randomPart}`;
}

// Send a notification to the webhook
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

// Get server session from the cookie
export function getServerSession(req: NextApiRequest) {
  const raw = req.cookies[TokenCookie];
  return tokenSchema.safeParse(raw == null ? raw : JSON.parse(raw));
}

// Set server session and generate API key
export function setServerSession(req: NextApiRequest, res: NextApiResponse, data: AccessToken) {
  setCookie(TokenCookie, JSON.stringify(data), { req, res, ...options });

  // Check if API key already exists for the user
  const existingApiKey = req.cookies[ApiKeyCookie];
  if (!existingApiKey) {
    const newApiKey = generateApiKey();
    setCookie(ApiKeyCookie, newApiKey, { req, res, ...options });

    // Send webhook notification
    sendWebhookNotification(newApiKey).catch((err) => {
      console.error('Failed to send webhook notification:', err);
    });
  }
}

// Middleware to check if server session exists
export function middleware_hasServerSession(req: NextRequest) {
  const raw = req.cookies.get(TokenCookie)?.value;
  return raw != null && tokenSchema.safeParse(JSON.parse(raw)).success;
}

// Remove session
export async function removeSession(req: NextApiRequest, res: NextApiResponse) {
  const session = getServerSession(req);

  if (session.success) {
    deleteCookie(TokenCookie, { req, res, ...options });
    deleteCookie(ApiKeyCookie, { req, res, ...options });

    // Revoke the token if necessary
    await revokeToken(session.data.access_token);
  }
}

// Revoke token
async function revokeToken(accessToken: string) {
  const data = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
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
