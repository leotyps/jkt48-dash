import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_URL, // Pastikan ada di .env
  ssl: {
    rejectUnauthorized: false, // Gunakan jika PostgreSQL membutuhkan SSL
  },
});

/**
 * Fungsi untuk menghubungkan ke database PostgreSQL
 */
export const connectToDatabase = async () => {
  return pool;
};
