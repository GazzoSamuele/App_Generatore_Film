import { Schema, model, Types } from "mongoose";

export interface IVisione {
  film: Types.ObjectId;
  valutazione: number;
  dataVisione: Date;
}

export interface IUtente {
  nome: string;
  email: string;
  generiPreferiti: string[];
  piattaformeAttive: string[];
  storicoVisto: IVisione[];
}

const visioneSchema = new Schema<IVisione>(
  {
    film: { type: Schema.Types.ObjectId, ref: "Film", required: true },
    valutazione: { type: Number, min: 1, max: 5, required: true },
    dataVisione: { type: Date, default: Date.now },
  },
  { _id: false }
);

const utenteSchema = new Schema<IUtente>(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    generiPreferiti: { type: [String], default: [] },
    piattaformeAttive: { type: [String], default: [] },
    storicoVisto: { type: [visioneSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "utenti",
  }
);

export const Utente = model<IUtente>("Utente", utenteSchema);
