import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jkt48connect:<db_password>@jkt48connect.i1ksz.mongodb.net/?retryWrites=true&w=majority&appName=jkt48connect";
const MONGODB_DB = "jkt48connect"; // Nama database yang digunakan

if (!MONGODB_URI) {
  throw new Error("❌ MongoDB URI tidak ditemukan di environment variables.");
}

let cachedClient: MongoClient | null = null;

/**
 * Fungsi untuk menghubungkan ke MongoDB
 */
export const connectToDatabase = async () => {
  if (cachedClient) {
    return cachedClient.db(MONGODB_DB);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Terhubung ke MongoDB");
  
  cachedClient = client;
  return client.db(MONGODB_DB);
};
