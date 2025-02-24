// utils/db.ts

import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://jkt48connect:i6SDcf2nFcqewY2i@jkt48connect.i1ksz.mongodb.net/?retryWrites=true&w=majority&appName=jkt48connect";

if (!MONGO_URL) {
  throw new Error("❌ Database URL (MONGO_URL) tidak ditemukan di environment variables!");
}

let client: MongoClient;
let db: any;

export const connectToDatabase = async () => {
  if (!client) {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("✅ Terhubung ke MongoDB");
    db = client.db(); // Gunakan default database dari URL
  }
  return db;
};
