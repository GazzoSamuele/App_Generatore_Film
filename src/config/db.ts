import mongoose from "mongoose";

let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI non definita: controlla il file .env");
  }

  if (!connection) {
    connection = mongoose.connect(uri).catch((errore) => {
      connection = null;
      throw errore;
    });
  }

  return connection;
}
