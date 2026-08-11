import type { Request, Response } from "express";
import { Utente } from "../models/Utente.js";

export async function listaUtenti(_req: Request, res: Response) {
  try {
    const utenti = await Utente.find({}, "nome email generiPreferiti").lean();
    res.json(utenti);
  } catch (errore) {
    console.error("Errore nel recupero utenti:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}
