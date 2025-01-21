import { NextApiRequest, NextApiResponse } from 'next';
import client from '@/lib/db';  // Import the CockroachDB client

// API endpoint for linking Gmail account to the user
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the request is a POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Get user session (optional, depends on your session management)
  // You can use getSession() if you're using next-auth or similar
  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { email } = req.body; // Get email from the request body

  // Check if email is provided
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if the email already exists in the database
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length > 0) {
      return res.status(400).json({ message: 'This Gmail account is already linked to another user.' });
    }

    // Update the user in the database to link the Gmail account
    const updateResult = await client.query(
      'UPDATE users SET gmail = $1 WHERE id = $2 RETURNING *',
      [email, session.user.id]
    );

    // Respond with success
    if (updateResult.rows.length > 0) {
      return res.status(200).json({
        message: 'Gmail account linked successfully',
        user: updateResult.rows[0],
      });
    } else {
      return res.status(400).json({ message: 'Failed to update user with Gmail.' });
    }
  } catch (error) {
    console.error('Error linking Gmail:', error);
    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}
