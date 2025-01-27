import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.COCKROACHDB_URL,  // Pastikan Anda sudah menyiapkan URL koneksi di .env
  ssl: {
    rejectUnauthorized: false,  // Sertifikat SSL
  },
});

export const connectToDatabase = async () => {
  return pool;
};
