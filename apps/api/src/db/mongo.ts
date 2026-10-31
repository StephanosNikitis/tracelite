import mongoose from "mongoose";

export async function connectMongo(uri: string): Promise<void> {
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
  mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}

export async function pingMongo(): Promise<boolean> {
  try {
    const db = mongoose.connection.db;
    if (mongoose.connection.readyState !== 1 || !db) return false;
    await db.admin().ping();
    return true;
  } catch {
    return false;
  }
}
