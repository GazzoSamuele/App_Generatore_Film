import type { IFilm } from "../models/Film.js";

export interface ProfiloGusti {
  generi: Map<string, number>;
  tag: Map<string, number>;
  titoliAmati: IFilm[];
  nomi: Map<string, number>;

}

export interface VisioneRisolta {
  film: IFilm;
  valutazione: number;
  dataVisione: Date;
}

const PESO_GENERE_DICHIARATO = 1.5;
const PESO_TAG_RELATIVO = 0.5;
const VALUTAZIONE_NEUTRA = 3;
const SOGLIA_AMATO = 4;
const PESO_ATTORE_RELATIVO = 0.3;
const EMIVITA_GIORNI = 365;

export function pesoDaValutazione(valutazione: number): number {
  return valutazione - VALUTAZIONE_NEUTRA;
}

function accumula(mappa: Map<string, number>, chiave: string, valore: number): void {
  mappa.set(chiave, (mappa.get(chiave) ?? 0) + valore);
}

function normalizza(mappa: Map<string, number>): void {
  let massimo = 0;
  for (const valore of mappa.values()) {
    massimo = Math.max(massimo, Math.abs(valore));
  }
  if (massimo === 0) return;

  for (const [chiave, valore] of mappa) {
    mappa.set(chiave, valore / massimo);
  }
}

export function fattoreDecadimento(dataVisione: Date, adesso: Date = new Date()): number {
  const millisecondi = adesso.getTime() - dataVisione.getTime();
  const giorni = Math.max(0, millisecondi / (1000 * 60 * 60 * 24));
  return 0.5 ** (giorni / EMIVITA_GIORNI);
}

export function costruisciProfilo(
  generiPreferiti: string[],
  visioni: VisioneRisolta[]
): ProfiloGusti {
  const nomi = new Map<string, number>();
  const generi = new Map<string, number>();
  const tag = new Map<string, number>();
  const titoliAmati: IFilm[] = [];

  for (const genere of generiPreferiti) {
    accumula(generi, genere, PESO_GENERE_DICHIARATO);
  }

  for (const { film, valutazione, dataVisione } of visioni) {
    const peso = pesoDaValutazione(valutazione) * fattoreDecadimento(dataVisione);

    if (peso === 0) continue;

    for (const genere of film.generi) {
      accumula(generi, genere, peso);
    }

    accumula(nomi, film.regista, peso);

    for (const nome of film.cast) {
      accumula(nomi, nome, peso * PESO_ATTORE_RELATIVO);
    } 
    for (const etichetta of film.tag) {
      accumula(tag, etichetta, peso * PESO_TAG_RELATIVO);
    }

    if (valutazione >= SOGLIA_AMATO) titoliAmati.push(film);
  }

  normalizza(generi);
  normalizza(tag);
  normalizza(nomi);

  return { generi, tag, titoliAmati, nomi };
}
