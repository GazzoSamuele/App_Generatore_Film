import mongoose from "mongoose";

/**
 * Apre la connessione a MongoDB.
 * La chiamiamo UNA sola volta all'avvio: Mongoose poi mantiene il collegamento
 * aperto e lo riusa per tutte le query (si chiama "connection pooling").
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  // Controllo difensivo: se manca la variabile, meglio fermarsi subito
  // con un messaggio chiaro, piuttosto che schiantarsi più avanti in modo oscuro.
  if (!uri) {
    throw new Error("MONGODB_URI non definita: controlla il file .env");
  }

  // "await" aspetta che la connessione sia stabilita prima di proseguire.
  await mongoose.connect(uri);

  console.log("✅ MongoDB connesso");
}
