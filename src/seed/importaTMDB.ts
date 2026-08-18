import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Film, type IFilm } from "../models/Film.js";
import { Utente } from "../models/Utente.js";
import { mappaFilm } from "./mappaTMDB.js";
import type { DettaglioFilmTMDB, PaginaPopolariTMDB } from "./tipiTMDB.js";

const BASE = "https://api.themoviedb.org/3";
const LINGUA = "it-IT";
const PAGINE = 10;
const PAUSA_MS = 100;
const OGNI_QUANTI_LOG = 20;

const API_KEY = process.env.TMDB_API_KEY;

function pausa(ms: number): Promise<void> {
  return new Promise((risolvi) => setTimeout(risolvi, ms));
}

async function chiamaTMDB<T>(
  percorso: string,
  parametri: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BASE}${percorso}`);
  url.searchParams.set("api_key", API_KEY ?? "");
  url.searchParams.set("language", LINGUA);
  for (const [chiave, valore] of Object.entries(parametri)) {
    url.searchParams.set(chiave, valore);
  }

  const risposta = await fetch(url);
  if (!risposta.ok) {
    throw new Error(`TMDB ha risposto ${risposta.status} su ${percorso}`);
  }
  return (await risposta.json()) as T;
}

async function raccogliIds(): Promise<number[]> {
  const ids: number[] = [];

  for (let pagina = 1; pagina <= PAGINE; pagina++) {
   const oggi = new Date().toISOString().slice(0, 10);

  const dati = await chiamaTMDB<PaginaPopolariTMDB>("/discover/movie", {
    page: String(pagina),
    sort_by: "vote_count.desc",
    "vote_count.gte": "1000",
    "release_date.lte": oggi,
  });
    ids.push(...dati.results.map((f) => f.id));
    await pausa(PAUSA_MS);
  }

  return ids;
}

async function scaricaFilm(ids: number[]): Promise<{ film: IFilm[]; scartati: number }> {
  const film: IFilm[] = [];
  let scartati = 0;

  for (const [indice, id] of ids.entries()) {
    try {
      const dettaglio = await chiamaTMDB<DettaglioFilmTMDB>(`/movie/${id}`, {
        append_to_response: "credits,keywords,watch/providers",
      });

      const mappato = mappaFilm(dettaglio);

      if (mappato.anno === 0 || mappato.generi.length === 0) {
        scartati++;
      } else {
        film.push(mappato);
      }
    } catch (errore) {
      scartati++;
      const messaggio = errore instanceof Error ? errore.message : String(errore);
      console.warn(`   ⚠️  film ${id} saltato: ${messaggio}`);
    }

    if ((indice + 1) % OGNI_QUANTI_LOG === 0) {
      console.log(`   ${indice + 1}/${ids.length}`);
    }
    await pausa(PAUSA_MS);
  }

  return { film, scartati };
}

async function importa() {
  if (!API_KEY) {
    throw new Error("TMDB_API_KEY non definita: controlla il file .env");
  }

  await connectDB();

  console.log(`📥 Raccolgo gli id da ${PAGINE} pagine di /movie/popular...`);
  const ids = await raccogliIds();
  console.log(`   ${ids.length} id raccolti`);

  console.log("🎬 Scarico i dettagli...");
  const { film, scartati } = await scaricaFilm(ids);

  console.log("🧹 Svuoto la collezione films...");
  await Film.deleteMany({});

  const inseriti = await Film.insertMany(film);
  console.log(`✅ ${inseriti.length} film importati, ${scartati} scartati`);

  const azzerati = await Utente.updateMany({}, { $set: { storicoVisto: [] } });
  console.log(
    `♻️  Storico azzerato per ${azzerati.modifiedCount} utenti (i vecchi id non esistono più)`
  );
}

importa()
  .catch((errore) => {
    console.error("❌ Import fallito:", errore);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
