// pages/api/auth/setSession.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { setServerSession } from '@/utils/auth/server'; // Import setServerSession

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userSession = req.body;
    
    // Simpan sesi menggunakan setServerSession
    // Periksa bahwa setServerSession menerima dua argumen (req dan res)
    // dan disesuaikan dengan tipe yang benar
    setServerSession(userSession, req, res);  // Pastikan fungsi ini menerima req dan res dari API route

    return res.status(200).json({ success: true });
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
