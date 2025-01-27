import { NextApiRequest, NextApiResponse } from 'next';
import { getOrCreateApiKey } from '@/utils/auth/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = await getOrCreateApiKey(req, res);
  res.status(200).json({ apiKey });
}
