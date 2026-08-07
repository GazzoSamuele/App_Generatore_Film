import { Schema, model } from "mongoose";

/**
 * INTERFACCIA TypeScript: descrive la forma di un Film per il COMPILATORE.
 * Vive solo durante la scrittura del codice: ti dà autocompletamento ed errori
 * se scrivi "film.titlo". A runtime sparisce completamente.
 */
export interface IFilm {
  titolo: string;
  tipo: "film" | "serie"; // "union type": sono ammessi SOLO questi due valori
  generi: string[]; // es. ["Sci-Fi", "Thriller"] — il campo più importante per l'algoritmo
  tag: string[]; // etichette più fini: ["spaziale", "viaggi nel tempo", "distopico"]
  anno: number;
  durataMinuti: number;
  piattaforma: string; // Netflix, Prime, Disney+...
  regista: string;
  cast: string[];
  descrizione: string;
  posterUrl: string;
  votoMedio: number; // 0-10, usato come "spinta" nel punteggio finale
}

/**
 * SCHEMA Mongoose: descrive la forma del documento per il DATABASE.
 * Vive a runtime e fa da guardiano: valida i dati prima di salvarli.
 *
 * Perché servono entrambi? L'interfaccia protegge te mentre scrivi,
 * lo schema protegge il database da dati sbagliati che arrivano dall'esterno.
 */
const filmSchema = new Schema<IFilm>(
  {
    titolo: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["film", "serie"], default: "film" },

    // "index: true" crea un indice: rende velocissime le ricerche per genere.
    // Senza indice MongoDB scorrerebbe TUTTI i documenti uno per uno.
    generi: { type: [String], required: true, index: true },
    tag: { type: [String], default: [] },

    anno: { type: Number, required: true },
    durataMinuti: { type: Number, default: 0 },
    piattaforma: { type: String, default: "Sconosciuta" },
    regista: { type: String, default: "" },
    cast: { type: [String], default: [] },
    descrizione: { type: String, default: "" },
    posterUrl: { type: String, default: "" },

    // "min" e "max" sono validatori: un voto 11 verrebbe rifiutato al salvataggio.
    votoMedio: { type: Number, min: 0, max: 10, default: 0 },
  },
  {
    // Aggiunge automaticamente createdAt e updatedAt a ogni documento.
    timestamps: true,
  }
);

// Il modello è l'oggetto con cui interroghi il database: Film.find(), Film.create()...
// Mongoose creerà la collezione al plurale minuscolo: "films".
export const Film = model<IFilm>("Film", filmSchema);
