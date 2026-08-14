import { Schema, model } from "mongoose";

export interface IFilm {
  titolo: string;
  tipo: "film" | "serie";
  generi: string[];
  tag: string[];
  anno: number;
  durataMinuti: number;
  piattaforme: string[];
  regista: string;
  cast: string[];
  descrizione: string;
  posterUrl: string;
  votoMedio: number;
}

const filmSchema = new Schema<IFilm>(
  {
    titolo: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["film", "serie"], default: "film" },
    generi: { type: [String], required: true, index: true },
    tag: { type: [String], default: [] },
    anno: { type: Number, required: true },
    durataMinuti: { type: Number, default: 0 },
    piattaforme: { type: [String], default: [] },
    regista: { type: String, default: "" },
    cast: { type: [String], default: [] },
    descrizione: { type: String, default: "" },
    posterUrl: { type: String, default: "" },
    votoMedio: { type: Number, min: 0, max: 10, default: 0 },
  },
  { timestamps: true }
);

export const Film = model<IFilm>("Film", filmSchema);
