import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from '@/utils/auth/googleServer'; // Pastikan ini sudah diimplementasi

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Memanggil getServerSession dengan hanya req
    const session = await getServerSession(req); // Pastikan hanya memberikan 1 argumen
    if (!session) {
      return res.status(401).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
