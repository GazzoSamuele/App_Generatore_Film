import { Schema, model, Types } from "mongoose";

/**
 * Una singola voce dello storico: "questo utente ha visto QUEL film".
 * È il dato più prezioso del progetto: da qui l'algoritmo capisce i gusti REALI,
 * che spesso non coincidono con quelli dichiarati.
 */
export interface IVisione {
  film: Types.ObjectId; // RIFERIMENTO al film, non una copia dei suoi dati
  valutazione: number; // 1-5 stelle date dall'utente
  dataVisione: Date;
}

export interface IUtente {
  nome: string;
  email: string;
  generiPreferiti: string[]; // gusti DICHIARATI (quelli che sceglie all'iscrizione)
  piattaformeAttive: string[]; // a quali servizi è abbonato: filtriamo ciò che non può guardare
  storicoVisto: IVisione[]; // gusti DIMOSTRATI
}

const visioneSchema = new Schema<IVisione>(
  {
    // "ref" dice a Mongoose che questo ObjectId punta alla collezione dei Film.
    // Permette la populate(): sostituire l'id con il documento completo.
    film: { type: Schema.Types.ObjectId, ref: "Film", required: true },
    valutazione: { type: Number, min: 1, max: 5, required: true },
    dataVisione: { type: Date, default: Date.now },
  },
  { _id: false } // è un sotto-documento: non serve che abbia un id proprio
);

const utenteSchema = new Schema<IUtente>(
  {
    nome: { type: String, required: true, trim: true },

    // "unique" impedisce due utenti con la stessa email.
    // "lowercase" normalizza: Mario@X.it e mario@x.it diventano lo stesso valore.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    generiPreferiti: { type: [String], default: [] },
    piattaformeAttive: { type: [String], default: [] },

    // Array di sotto-documenti: lo storico vive DENTRO l'utente.
    storicoVisto: { type: [visioneSchema], default: [] },
  },
  {
    timestamps: true,
    // Senza questa riga Mongoose pluralizzerebbe "Utente" in "utentes".
    // Meglio decidere noi il nome della collezione.
    collection: "utenti",
  }
);

export const Utente = model<IUtente>("Utente", utenteSchema);
