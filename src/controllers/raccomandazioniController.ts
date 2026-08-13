import type { Request, Response } from "express";
import { generaRaccomandazioni } from "../services/raccomandazioni.js";

const LIMITE_MIN = 6;
const LIMITE_MAX = 8;

function limiteDa(valore: unknown): number {
  const numero = Number(valore);
  if (!Number.isFinite(numero) || numero <= 0) return LIMITE_MAX;
  return Math.min(Math.max(numero, LIMITE_MIN), LIMITE_MAX);
}

export async function getRaccomandazioni(req: Request, res: Response) {
  try {
    const { utenteId } = req.params;
    const limite = limiteDa(req.query.limite);

    const raccomandazioni = await generaRaccomandazioni(utenteId as string, limite);

    res.json({
      totale: raccomandazioni.length,
      raccomandazioni: raccomandazioni.map((r) => ({
        id: String(r.film._id),
        titolo: r.film.titolo,
        tipo: r.film.tipo,
        anno: r.film.anno,
        generi: r.film.generi,
        piattaforma: r.film.piattaforma,
        posterUrl: r.film.posterUrl,
        votoMedio: r.film.votoMedio,
        compatibilita: r.compatibilita,
        motivi: r.motivi,
        punteggio: Number(r.punteggio.toFixed(3)),
      })),
    });
  } catch (errore) {
    const messaggio = errore instanceof Error ? errore.message : "Errore sconosciuto";

    if (messaggio === "Utente non trovato") {
      res.status(404).json({ errore: messaggio });
      return;
    }

    console.error("Errore nelle raccomandazioni:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}
