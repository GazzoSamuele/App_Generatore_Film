import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Utente } from "../models/Utente.js";
import { Film } from "../models/Film.js";

const VALUTAZIONE_MIN = 1;
const VALUTAZIONE_MAX = 5;

export async function listaUtenti(_req: Request, res: Response) {
  try {
    const utenti = await Utente.find({}, "nome email generiPreferiti").lean();
    res.json(utenti);
  } catch (errore) {
    console.error("Errore nel recupero utenti:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}

export async function aggiungiVisione(req: Request, res: Response) {
  try {
    const { utenteId } = req.params;
    const { filmId, valutazione } = req.body;

    if (!Types.ObjectId.isValid(String(utenteId))) {
      res.status(400).json({ errore: "utenteId non valido" });
      return;
    }

    if (typeof filmId !== "string" || !Types.ObjectId.isValid(filmId)) {
      res.status(400).json({ errore: "filmId non valido" });
      return;
    }

    if (
      !Number.isInteger(valutazione) ||
      valutazione < VALUTAZIONE_MIN ||
      valutazione > VALUTAZIONE_MAX
    ) {
      res.status(400).json({
        errore: `valutazione deve essere un intero tra ${VALUTAZIONE_MIN} e ${VALUTAZIONE_MAX}`,
      });
      return;
    }

    const utente = await Utente.findById(utenteId);
    if (!utente) {
      res.status(404).json({ errore: "Utente non trovato" });
      return;
    }

    const film = await Film.findById(filmId).lean();
    if (!film) {
      res.status(404).json({ errore: "Film non trovato" });
      return;
    }

    const giaVisto = utente.storicoVisto.some((v) => String(v.film) === filmId);
    if (giaVisto) {
      res.status(409).json({ errore: "Film già presente nello storico" });
      return;
    }

    utente.storicoVisto.push({
      film: film._id,
      valutazione,
      dataVisione: new Date(),
    });
    await utente.save();

    res.status(201).json({
      messaggio: "Visione registrata",
      titolo: film.titolo,
      valutazione,
      totaleVisioni: utente.storicoVisto.length,
    });
  } catch (errore) {
    console.error("Errore nell'aggiunta della visione:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}
