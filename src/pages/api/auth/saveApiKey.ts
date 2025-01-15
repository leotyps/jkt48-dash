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

      // Ensure `expiryDate` is stored as a string (text type)
      const expiryDateFormatted = expiryDate;

      // Ensure `remaining_requests` and `max_requests` are stored as strings (text type)
      const remainingRequests = String(limit); // Convert limit to string
      const maxRequests = String(limit); // Convert limit to string

      // Ensure `lastAccessDate` is stored as a string (text type)
      const lastAccessDate = new Date().toISOString(); // Convert to ISO string format

      // Insert into the database
      const result = await client.query(
        `INSERT INTO api_keys (api_key, expiry_date, remaining_requests, max_requests, last_access_date, seller)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING api_key`,
        [
          apiKey, // Text type
          expiryDateFormatted, // Text type
          remainingRequests, // Text type
          maxRequests, // Text type
          lastAccessDate, // Text type
          seller || false, // Boolean type, default to false if not provided
        ]
      );

      client.release();

      // Check if the result contains rows and handle properly
      if (result && result.rows && result.rows.length > 0) {
        return res.status(200).json({
          message: "API Key successfully created",
          apiKey: result.rows[0].api_key,
        });
      } else {
        console.error("Error: No rows returned from the database.");
        return res.status(500).json({ message: "Failed to create API Key, no rows returned." });
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
