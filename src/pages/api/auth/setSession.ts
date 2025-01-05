// pages/api/auth/setSession.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { setServerSession } from '@/utils/auth/server'; // Import setServerSession
import { AccessToken } from '@/utils/auth/server'; // Pastikan mengimpor tipe yang sesuai

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const userSession: AccessToken = req.body; // Pastikan body sesuai dengan tipe AccessToken
    
    // Simpan sesi menggunakan setServerSession
    setServerSession(req, res, userSession);  // Kirim req, res, dan data sesi dengan tipe yang benar

    return res.status(200).json({ success: true });
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
