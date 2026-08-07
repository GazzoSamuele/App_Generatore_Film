import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Film } from "../models/Film.js";
import { Utente } from "../models/Utente.js";
import { catalogo } from "./catalogo.js";

/**
 * SCRIPT DI SEED — "semina" i dati iniziali nel database.
 *
 * ⚠️ È DISTRUTTIVO: svuota le collezioni "films" e "utenti" prima di riempirle.
 * Lo facciamo per avere sempre un punto di partenza identico e prevedibile
 * (si dice "idempotente": lanciarlo 10 volte dà lo stesso risultato di lanciarlo una).
 * Non tocca nessun'altra collezione del database.
 */
async function seed() {
  await connectDB();

  // --- 1. CATALOGO ---
  console.log("🧹 Svuoto le collezioni films e utenti...");
  await Film.deleteMany({}); // {} = filtro vuoto = "tutti i documenti"
  await Utente.deleteMany({});

  console.log("🎬 Inserisco il catalogo...");
  // insertMany fa UNA sola chiamata al database per tutti i documenti:
  // molto più veloce di 24 create() separate (24 viaggi di rete verso Atlas).
  const filmInseriti = await Film.insertMany(catalogo);
  console.log(`   ${filmInseriti.length} titoli inseriti`);

  // --- 2. UTENTE DI PROVA ---
  // Costruiamo una mappa "titolo → _id" per collegare lo storico ai film appena
  // inseriti. Gli _id li genera MongoDB al momento dell'inserimento, quindi non
  // possiamo scriverli a mano: dobbiamo leggerli da ciò che è appena tornato.
  const idPerTitolo = new Map(filmInseriti.map((f) => [f.titolo, f._id]));

  /** Piccolo aiuto: recupera l'id di un film o esplode con un messaggio chiaro. */
  function idDi(titolo: string) {
    const id = idPerTitolo.get(titolo);
    if (!id) throw new Error(`Film non trovato nel catalogo: "${titolo}"`);
    return id;
  }

  console.log("👤 Creo l'utente di prova...");
  await Utente.create({
    nome: "Samuele",
    email: "samuele@example.com",

    // Gusti DICHIARATI
    generiPreferiti: ["Fantascienza", "Thriller"],
    piattaformeAttive: ["Netflix", "Prime Video"],

    // Gusti DIMOSTRATI: nota che le valutazioni raccontano una storia precisa.
    // Ama fantascienza cerebrale (5 stelle), tollera l'azione (3),
    // detesta il romantico (1). L'algoritmo dovrà "leggere" tutto questo.
    storicoVisto: [
      { film: idDi("Inception"), valutazione: 5, dataVisione: new Date("2026-01-10") },
      { film: idDi("Interstellar"), valutazione: 5, dataVisione: new Date("2026-02-02") },
      { film: idDi("Se7en"), valutazione: 4, dataVisione: new Date("2026-03-15") },
      { film: idDi("Mad Max: Fury Road"), valutazione: 3, dataVisione: new Date("2026-04-01") },
      { film: idDi("Notting Hill"), valutazione: 1, dataVisione: new Date("2026-05-20") },
    ],
  });

  console.log("✅ Seed completato!");
}

// Avvio con gestione esplicita di successo ed errore.
// "finally" garantisce che la connessione venga chiusa in ogni caso:
// senza disconnect() il processo resterebbe appeso e non tornerebbe al prompt.
seed()
  .catch((errore) => {
    console.error("❌ Seed fallito:", errore);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
