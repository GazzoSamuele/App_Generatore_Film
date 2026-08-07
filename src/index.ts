import "dotenv/config"; // legge il file .env e riempie process.env — deve stare per PRIMO
import express from "express";
import { connectDB } from "./config/db.js"; // NB: ".js" anche se il file è .ts (vedi spiegazione)

const app = express();
const PORT = process.env.PORT ?? 3000; // "??" = se PORT non esiste, usa 3000

// MIDDLEWARE: funzioni che ogni richiesta attraversa PRIMA di arrivare alle route.
// Questo insegna a Express a leggere il corpo delle richieste in formato JSON.
app.use(express.json());

// ROTTA DI PROVA ("health check"): serve a verificare che il server sia vivo.
// req = la richiesta in arrivo, res = la risposta che mandiamo indietro.
app.get("/", (req, res) => {
  res.json({ messaggio: "🎬 Movie Recommender API - il server è vivo!" });
});

/**
 * Avvio dell'applicazione.
 * L'ordine è importante: PRIMA il database, POI il server.
 * Se il DB non risponde, è inutile accettare richieste che fallirebbero comunque.
 */
async function avvia() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
    });
  } catch (errore) {
    console.error("❌ Avvio fallito:", errore);
    process.exit(1); // esce con codice 1 = "terminato per errore"
  }
}

avvia();
