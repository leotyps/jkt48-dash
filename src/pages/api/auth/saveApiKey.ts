// pages/api/saveApiKey.ts

import { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgresql://jkt48connect_apikey:vAgy5JNXz4woO46g8fho4g@jkt48connect-7018.j77.aws-ap-southeast-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full",
});

const saveApiKey = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { apiKey, expiryDate, limit, seller } = req.body;

    if (!apiKey || !expiryDate || !limit) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    try {
      const client = await pool.connect();

      // Default values
      const remainingRequests = limit; // Or any default value you want for remainingRequests
      const maxRequests = limit; // Same for maxRequests
      const lastAccessDate = new Date().toISOString(); // Use current timestamp for last_access_date

      // Insert into the database
      const result = await client.query(
        `INSERT INTO api_keys (api_key, expiry_date, remaining_requests, max_requests, last_access_date, seller)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          apiKey,
          expiryDate, // Expiry date from the request body
          remainingRequests, // Remaining requests
          maxRequests, // Max requests
          lastAccessDate, // Current timestamp as last access date
          seller || false, // Default seller value is false if not provided
        ]
      );

      client.release();

      if (result && result.rowCount !== null && result.rowCount > 0) {
  return res.status(200).json({
    message: "API Key successfully created",
    apiKey: result.rows[0].api_key,
  });
} else {
  return res.status(500).json({ message: "Failed to create API Key" });
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
