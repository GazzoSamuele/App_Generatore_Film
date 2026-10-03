import type { Request, Response } from "express";
import { Types } from "mongoose";
import { Utente } from "../models/Utente.js";
import { Film } from "../models/Film.js";

const VALUTAZIONE_MIN = 1;
const VALUTAZIONE_MAX = 5;
const NOME_MAX = 60;
const PROFILI_MAX = 20;

export async function listaUtenti(req: Request, res: Response) {
  try {
    const { ids } = req.query;

    if (typeof ids !== "string") {
      res
        .status(400)
        .json({ errore: "Indica i profili da caricare con ?ids=id1,id2" });
      return;
    }

    const richiesti = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (richiesti.length > PROFILI_MAX) {
      res
        .status(400)
        .json({ errore: `Puoi chiedere al massimo ${PROFILI_MAX} profili` });
      return;
    }

    if (richiesti.some((id) => !Types.ObjectId.isValid(id))) {
      res.status(400).json({ errore: "ids contiene un id non valido" });
      return;
    }

    const utenti = await Utente.find(
      { _id: { $in: richiesti } },
      "nome generiPreferiti",
    ).lean();

    res.json(utenti);
  } catch (errore) {
    console.error("Errore nel recupero utenti:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}

export async function creaUtente(req: Request, res: Response) {
  try {
    const { nome } = req.body;

    if (typeof nome !== "string" || nome.trim().length === 0) {
      res.status(400).json({ errore: "nome obbligatorio" });
      return;
    }

    const nomePulito = nome.trim();
    if (nomePulito.length > NOME_MAX) {
      res
        .status(400)
        .json({ errore: `nome troppo lungo (massimo ${NOME_MAX} caratteri)` });
      return;
    }

    const utente = await Utente.create({ nome: nomePulito });

    res.status(201).json({
      _id: String(utente._id),
      nome: utente.nome,
      generiPreferiti: utente.generiPreferiti,
    });
  } catch (errore) {
    console.error("Errore nella creazione dell'utente:", errore);
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

export async function rimuoviVisione(req: Request, res: Response) {
  try {
    const { utenteId, filmId } = req.params;

    if (!Types.ObjectId.isValid(String(utenteId))) {
      res.status(400).json({ errore: "utenteId non valido" });
      return;
    }

    if (typeof filmId !== "string" || !Types.ObjectId.isValid(filmId)) {
      res.status(400).json({ errore: "filmId non valido" });
      return;
    }

    const esiste = await Utente.exists({ _id: utenteId });
    if (!esiste) {
      res.status(404).json({ errore: "Utente non trovato" });
      return;
    }

    const risultato = await Utente.updateOne(
      { _id: utenteId, "storicoVisto.film": filmId },
      { $pull: { storicoVisto: { film: filmId } } },
    );

    if (risultato.matchedCount === 0) {
      res.status(404).json({ errore: "Voto non trovato" });
      return;
    }
    res.json({ messaggio: "Voto annullato" });
  } catch (errore) {
    console.error("Errore nella rimozione della visione:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}

export async function aggiornaPreferenze(req: Request, res: Response) {
  try {
    const { utenteId } = req.params;
    const { generiPreferiti } = req.body;

    if (!Types.ObjectId.isValid(String(utenteId))) {
      res.status(400).json({ errore: "utenteId non valido" });
      return;
    }

    if (
      !Array.isArray(generiPreferiti) ||
      generiPreferiti.some((g) => typeof g !== "string")
    ) {
      res
        .status(400)
        .json({ errore: "generiPreferiti deve essere un array di stringhe" });
      return;
    }

    const utente = await Utente.findByIdAndUpdate(
      utenteId,
      { $set: { generiPreferiti } },
      { new: true },
    );
    if (!utente) {
      res.status(404).json({ errore: "Utente non trovato" });
      return;
    }
    res.json({
      messaggio: "Preferenze aggiornate",
      generiPreferiti: utente.generiPreferiti,
    });
  } catch (errore) {
    console.error("Errore nell'aggiornamento delle preferenze:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}
export async function dettaglioUtente(req: Request, res: Response) {
  try {
    const { utenteId } = req.params;

    if (!Types.ObjectId.isValid(String(utenteId))) {
      res.status(400).json({ errore: "utenteId non valido" });
      return;
    }

    const utente = await Utente.findById(
      utenteId,
      "nome generiPreferiti",
    ).lean();

    if (!utente) {
      res.status(404).json({ errore: "Utente non trovato" });
      return;
    }

    res.json(utente);
  } catch (errore) {
    console.error(errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}
