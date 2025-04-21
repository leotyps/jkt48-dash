import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { phone_number, team_id, amount } = req.query;

    if ((!phone_number && !team_id) || !amount) {
      return res.status(400).json({ error: 'Missing required fields: provide either phone_number or team_id, and amount' });
    }

    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid number greater than zero' });
    }

    const db = await connectToDatabase();

    // Cek user di tabel zenova
    let userQuery = `SELECT team_id, saldo FROM zenova WHERE `;
    let userParam;

    if (team_id) {
      userQuery += `team_id = $1`;
      userParam = [team_id];
    } else {
      userQuery += `phone_number = $1`;
      userParam = [phone_number];
    }

    const checkUserResult = await db.query(userQuery, userParam);

    if (checkUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateQuery = `
      UPDATE zenova
      SET saldo = saldo + $1
      WHERE team_id = $2
      RETURNING saldo;
    `;
    const updateResult = await db.query(updateQuery, [amountNumber, checkUserResult.rows[0].team_id]);

    res.status(200).json({ message: 'Saldo updated successfully', saldo: updateResult.rows[0].saldo });

  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
