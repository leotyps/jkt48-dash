// pages/api/saveApiKey.ts

import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full",
});

const saveApiKey = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { apiKey, expiryDate, limit } = req.body;

    if (!apiKey || !expiryDate || !limit) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    try {
      const client = await pool.connect();

      console.log("Inserting API key data into the database");
      console.log(`apiKey: ${apiKey}, expiryDate: ${expiryDate}, limit: ${limit}`);

      const result = await client.query(
        `INSERT INTO api_keys (api_key, expiry_date, remaining_requests, max_requests, last_access_date, seller)
         VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING api_key`,
        [
          apiKey,
          expiryDate,
          limit,
          limit,
          false, // default seller value is false
        ]
      );

      client.release();

      if (result.rows.length > 0) {
        return res.status(200).json({
          message: "API Key successfully created",
          apiKey: result.rows[0].api_key,
          status: "Aktif",
        });
      } else {
        return res.status(500).json({ message: "Failed to save API key." });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error saving API Key:", error); // Log error details
        return res.status(500).json({ message: `Internal server error: ${error.message}` });
      } else {
        console.error("Unknown error:", error);
        return res.status(500).json({ message: "Unknown error occurred." });
      }
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default saveApiKey;
