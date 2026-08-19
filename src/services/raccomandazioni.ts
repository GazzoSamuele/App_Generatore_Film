import { Film, type IFilm } from "../models/Film.js";
import { Utente } from "../models/Utente.js";
import {
  costruisciProfilo,
  type ProfiloGusti,
  type VisioneRisolta,
} from "./profiloUtente.js";

const PESO_GENERI = 0.40;
const PESO_TAG = 0.25;
const PESO_QUALITA = 0.20;
const PESO_PERSONE = 0.15;
const PENALITA_PIATTAFORMA = 0.15;
const MAX_PER_GENERE = 4;

function affinitaMedia(etichette: string[], profilo: Map<string, number>): number {
  if (etichette.length === 0) return 0;

  let somma = 0;
  for (const etichetta of etichette) {
    somma += profilo.get(etichetta) ?? 0;
  }
  return somma / etichette.length;
}

function elementiInComune(a: string[], b: string[]): string[] {
  const insieme = new Set(b);
  return a.filter((x) => insieme.has(x));
}

function generaMotivi(film: IFilm, profilo: ProfiloGusti): string[] {
  const motivi: string[] = [];

  const generiGraditi = film.generi
    .map((g) => ({ genere: g, punteggio: profilo.generi.get(g) ?? 0 }))
    .filter((g) => g.punteggio > 0.2)
    .sort((a, b) => b.punteggio - a.punteggio);

  if (generiGraditi[0]) {
    motivi.push(`Ami il genere ${generiGraditi[0].genere}`);
  }

  let piuSimile: { titolo: string; comuni: number } | null = null;
  for (const amato of profilo.titoliAmati) {
    const comuni =
      elementiInComune(film.generi, amato.generi).length +
      elementiInComune(film.tag, amato.tag).length;
    if (comuni > 0 && (!piuSimile || comuni > piuSimile.comuni)) {
      piuSimile = { titolo: amato.titolo, comuni };
    }
  }
  if (piuSimile) {
    motivi.push(`Simile a "${piuSimile.titolo}", che ti è piaciuto`);
  }

  if (film.votoMedio >= 8.5) {
    motivi.push(`Molto apprezzato (${film.votoMedio}/10)`);
  }

  const amiUnDeterminatoRegista = profilo.nomi.get(film.regista) ?? 0;
  if (amiUnDeterminatoRegista > 0.2) {
    motivi.push(`Ti piace il regista ${film.regista}`);
  }

  for (const attore of film.cast) {
    const amiUnDeterminatoAttore = profilo.nomi.get(attore) ?? 0;
    if (amiUnDeterminatoAttore > 0.2) {
      motivi.push(`Ti piace l'attore ${attore}`);
      break;
    }
  }

  if (motivi.length === 0) {
    motivi.push("Perché sì");
  }

  return motivi;
}

export function calcolaPunteggio(
  film: IFilm,
  profilo: ProfiloGusti,
  piattaformeAttive: string[]
): number {
  const affinitaGeneri = affinitaMedia(film.generi, profilo.generi);
  const affinitaTag = affinitaMedia(film.tag, profilo.tag);
  const qualita = film.votoMedio / 10;
  const affinitaPersone = affinitaMedia([film.regista, ...film.cast], profilo.nomi);

  let punteggio =
    affinitaGeneri * PESO_GENERI + affinitaTag * PESO_TAG + qualita * PESO_QUALITA + affinitaPersone * PESO_PERSONE;

  const disponibileSuUnaAttiva = film.piattaforme.some((p) =>
    piattaformeAttive.includes(p)
  );

  if (piattaformeAttive.length > 0 && !disponibileSuUnaAttiva) {
    punteggio -= PENALITA_PIATTAFORMA;
  }

  return punteggio;
}

function compatibilitaDa(punteggio: number): number {
  const normalizzato = (punteggio + 0.5) / 1.5;
  return Math.round(Math.max(0, Math.min(1, normalizzato)) * 100);
}

function applicaVarieta<T extends { film: IFilm }>(classifica: T[], limite: number): T[] {
  const conteggioGeneri = new Map<string, number>();
  const selezionati: T[] = [];

  for (const candidato of classifica) {
    if (selezionati.length === limite) break;

    const generi =
      candidato.film.generi.length > 0 ? candidato.film.generi : ["Sconosciuto"];

    const saturo = generi.some(
      (g) => (conteggioGeneri.get(g) ?? 0) >= MAX_PER_GENERE
    );

    if (!saturo) {
      selezionati.push(candidato);
      for (const g of generi) {
        conteggioGeneri.set(g, (conteggioGeneri.get(g) ?? 0) + 1);
      }
    }
  }

  for (const candidato of classifica) {
    if (selezionati.length === limite) break;
    if (!selezionati.includes(candidato)) selezionati.push(candidato);
  }

  return selezionati;
}

export async function generaRaccomandazioni(utenteId: string, limite = 8) {
  const utente = await Utente.findById(utenteId).lean();
  if (!utente) {
    throw new Error("Utente non trovato");
  }

  const idVisti = utente.storicoVisto.map((v) => v.film);
  const filmVisti = await Film.find({ _id: { $in: idVisti } }).lean();
  const filmPerId = new Map(filmVisti.map((f) => [String(f._id), f]));

  const visioni: VisioneRisolta[] = [];
  for (const visione of utente.storicoVisto) {
    const film = filmPerId.get(String(visione.film));
    if (film) {
      visioni.push({
        film,
        valutazione: visione.valutazione,
        dataVisione: visione.dataVisione,
      });
    }
  }

  const profilo = costruisciProfilo(utente.generiPreferiti, visioni);
  const candidati = await Film.find({ _id: { $nin: idVisti } }).lean();

  const classifica = candidati
    .map((film) => {
      const punteggio = calcolaPunteggio(film, profilo, utente.piattaformeAttive);
      return {
        film,
        punteggio,
        compatibilita: compatibilitaDa(punteggio),
        motivi: generaMotivi(film, profilo),
      };
    })
    .sort((a, b) => b.punteggio - a.punteggio);

  return applicaVarieta(classifica, limite);
}
