import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Utente } from "../models/Utente.js";
import { Film } from "../models/Film.js";
import { normalizzaPiattaforma } from "./mappaTMDB.js";

async function sistemaPiattaforme() {
  const titoli = await Film.find({}, "piattaforme").lean();
  let sistemati = 0;

  for (const titolo of titoli) {
    const pulite = [...new Set(titolo.piattaforme.map(normalizzaPiattaforma))];
    if (pulite.join() === titolo.piattaforme.join()) continue;

    await Film.updateOne(
      { _id: titolo._id },
      { $set: { piattaforme: pulite } },
    );
    sistemati++;
  }

  console.log(`Piattaforme sistemate in ${sistemati} titoli`);
}

async function ricercaEmail() {
  const esisteEmail = await Utente.collection.indexExists("email_1");
  if (esisteEmail) {
    await Utente.collection.dropIndex("email_1");
    console.log("email_1 è stata eliminata");
  } else {
    console.log("email_1 non presente");
  }

  const risultato = await Utente.collection.updateMany(
    { email: { $exists: true } },
    { $unset: { email: "" } },
  );
  console.log(`Email tolta da ${risultato.modifiedCount} profili`);
}

async function migra() {
  await connectDB();
  await ricercaEmail();
  await sistemaPiattaforme();
}

migra()
  .catch((errore) => {
    console.error("❌ Migrazione fallita:", errore);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
