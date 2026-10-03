import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Film, type IFilm } from "../models/Film.js";
import { Utente } from "../models/Utente.js";
import { mappaFilm, mappaSerie } from "./mappaTMDB.js";
import type {
  DettaglioFilmTMDB,
  DettaglioSerieTMDB,
  PaginaPopolariTMDB,
} from "./tipiTMDB.js";

const BASE = "https://api.themoviedb.org/3";
const LINGUA = "it-IT";
const PAGINE_PER_GENERE = 1;
const VOTI_MINIMI = "300";
const PAUSA_MS = 100;
const OGNI_QUANTI_LOG = 20;

const GENERI_TMDB: Record<string, number> = {
  Azione: 28,
  Avventura: 12,
  Animazione: 16,
  Commedia: 35,
  Crime: 80,
  Documentario: 99,
  Dramma: 18,
  Famiglia: 10751,
  Fantasy: 14,
  Storia: 36,
  Horror: 27,
  Musica: 10402,
  Mistero: 9648,
  Romantico: 10749,
  Fantascienza: 878,
  Thriller: 53,
  Guerra: 10752,
  Western: 37,
};

const GENERI_SERIE_TMDB: Record<string, number> = {
  "Action & Adventure": 10759,
  Animazione: 16,
  Commedia: 35,
  Crime: 80,
  Documentario: 99,
  Dramma: 18,
  Famiglia: 10751,
  Kids: 10762,
  Mistero: 9648,
  "Sci-Fi & Fantasy": 10765,
  "War & Politics": 10768,
  Western: 37,
};

const API_KEY = process.env.TMDB_API_KEY;

const TIPO = process.argv[2] ?? "film";
const PERCORSO_TMDB = TIPO === "film" ? "movie" : "tv";
const CAMPO_DATA = TIPO === "film" ? "release_date.lte" : "first_air_date.lte";
const GENERI = TIPO === "film" ? GENERI_TMDB : GENERI_SERIE_TMDB;

function pausa(ms: number): Promise<void> {
  return new Promise((risolvi) => setTimeout(risolvi, ms));
}

async function chiamaTMDB<T>(
  percorso: string,
  parametri: Record<string, string> = {},
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
  const oggi = new Date().toISOString().slice(0, 10);
  const ids = new Set<number>();

  for (const [nome, idGenere] of Object.entries(GENERI)) {
    let raccoltiPerGenere = 0;

    for (let pagina = 1; pagina <= PAGINE_PER_GENERE; pagina++) {
      const dati = await chiamaTMDB<PaginaPopolariTMDB>(
        `/discover/${PERCORSO_TMDB}`,
        {
          page: String(pagina),
          with_genres: String(idGenere),
          sort_by: "vote_count.desc",
          "vote_count.gte": VOTI_MINIMI,
          [CAMPO_DATA]: oggi,
        },
      );

      for (const film of dati.results) {
        ids.add(film.id);
      }
      raccoltiPerGenere += dati.results.length;
      await pausa(PAUSA_MS);
    }

    console.log(`   ${nome}: ${raccoltiPerGenere} candidati`);
  }

  return [...ids];
}

async function scaricaFilm(
  ids: number[],
): Promise<{ film: IFilm[]; scartati: number }> {
  const film: IFilm[] = [];
  let scartati = 0;

  for (const [indice, id] of ids.entries()) {
    try {
      let mappato: IFilm;

      if (TIPO === "film") {
        const dettaglio = await chiamaTMDB<DettaglioFilmTMDB>(`/movie/${id}`, {
          append_to_response: "credits,keywords,watch/providers",
        });
        mappato = mappaFilm(dettaglio);
      } else {
        const dettaglio = await chiamaTMDB<DettaglioSerieTMDB>(`/tv/${id}`, {
          append_to_response: "credits,keywords,watch/providers",
        });
        mappato = mappaSerie(dettaglio);
      }

      if (mappato.anno === 0 || mappato.generi.length === 0) {
        scartati++;
      } else {
        film.push(mappato);
      }
    } catch (errore) {
      scartati++;
      const messaggio =
        errore instanceof Error ? errore.message : String(errore);
      console.warn(`   ⚠️  ${TIPO} ${id} saltato: ${messaggio}`);
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

  if (TIPO !== "film" && TIPO !== "serie") {
    throw new Error("il tipo deve essere o film o serie");
  }

  await connectDB();

  console.log(`📥 Raccolgo gli id genere per genere...`);
  const ids = await raccogliIds();
  console.log(`   ${ids.length} ${TIPO}`);

  console.log("🎬 Scarico i dettagli...");
  const { film, scartati } = await scaricaFilm(ids);

  console.log(`🧹 Svuoto ${TIPO} serie...`);
  await Film.deleteMany({ tipo: TIPO });

  const inseriti = await Film.insertMany(film);
  console.log(`✅ ${inseriti.length} ${TIPO}, ${scartati} scartati`);

  const idsEsistenti = await Film.distinct("_id");
  const ripuliti = await Utente.updateMany(
    { storicoVisto: { $elemMatch: { film: { $nin: idsEsistenti } } } },
    { $pull: { storicoVisto: { film: { $nin: idsEsistenti } } } },
  );
  console.log(`♻️  Voti orfani tolti a ${ripuliti.matchedCount} utenti`);
}

importa()
  .catch((errore) => {
    console.error("❌ Import fallito:", errore);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
