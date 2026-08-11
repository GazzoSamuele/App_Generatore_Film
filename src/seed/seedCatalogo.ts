import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Film } from "../models/Film.js";
import { Utente } from "../models/Utente.js";
import { catalogo } from "./catalogo.js";

async function seed() {
  await connectDB();

  console.log("🧹 Svuoto le collezioni films e utenti...");
  await Film.deleteMany({});
  await Utente.deleteMany({});

  console.log("🎬 Inserisco il catalogo...");
  const filmInseriti = await Film.insertMany(catalogo);
  console.log(`   ${filmInseriti.length} titoli inseriti`);

  const idPerTitolo = new Map(filmInseriti.map((f) => [f.titolo, f._id]));

  function idDi(titolo: string) {
    const id = idPerTitolo.get(titolo);
    if (!id) throw new Error(`Film non trovato nel catalogo: "${titolo}"`);
    return id;
  }

  console.log("👤 Creo l'utente di prova...");
  await Utente.create({
    nome: "Samuele",
    email: "samuele@example.com",
    generiPreferiti: ["Fantascienza", "Thriller"],
    piattaformeAttive: ["Netflix", "Prime Video"],
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

seed()
  .catch((errore) => {
    console.error("❌ Seed fallito:", errore);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
