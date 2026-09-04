import { Film, type IFilm } from "../models/Film.js";
import type { Response, Request } from "express";
import type { QueryFilter } from "mongoose";

const PAGINA_MIN = 1;
const PER_PAGINA_DEFAULT = 20;
const PER_PAGINA_MAX = 50;

function paginaDa(valore: unknown): number {
  const numero = Number(valore);
  if (!Number.isFinite(numero) || numero < PAGINA_MIN) return PAGINA_MIN;
  return Math.floor(numero);
}

function perPaginaDa(valore: unknown): number {
  const numero = Number(valore);
  if (!Number.isFinite(numero) || numero <= 0) return PER_PAGINA_DEFAULT;
  return Math.min(Math.floor(numero), PER_PAGINA_MAX);
}

function escapeRegex(testo: string): string {
  return testo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listaFilm(req: Request, res: Response) {
  try {
    const pagina = paginaDa(req.query.pagina);
    const perPagina = perPaginaDa(req.query.perPagina);
    const { genere, tipo, ricerca } = req.query;

    const filtro: QueryFilter<IFilm> = {};

    if (typeof genere === "string" && genere.trim().length > 0) {
      filtro.generi = genere.trim();
    }

    if (tipo === "film" || tipo === "serie") {
      filtro.tipo = tipo;
    }

    if (typeof ricerca === "string" && ricerca.trim().length > 0) {
      filtro.titolo = { $regex: escapeRegex(ricerca.trim()), $options: "i" };
    }

    const [film, totale] = await Promise.all([
      Film.find(filtro)
        .sort({ votoMedio: -1 })
        .skip((pagina - 1) * perPagina)
        .limit(perPagina)
        .lean(),
      Film.countDocuments(filtro),
    ]);

    res.json({
      totale,
      pagina,
      perPagina,
      film: film.map((f) => ({
        id: String(f._id),
        titolo: f.titolo,
        tipo: f.tipo,
        anno: f.anno,
        generi: f.generi,
        piattaforme: f.piattaforme,
        posterUrl: f.posterUrl,
        votoMedio: f.votoMedio,
        descrizione: f.descrizione,
      })),
    });
  } catch (errore) {
    console.error("Errore nel caricamento del catalogo:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
}

export async function listaGeneri(req: Request, res: Response) {
    try{ 
        const conteggi = await Film.aggregate([
        { $unwind: "$generi" },
        { $group: { _id: "$generi", quanti: { $sum: 1 } } },
        { $sort: { quanti: -1 } },
        { $project: { _id: 0, genere: "$_id", quanti: 1 } },
        ]);
        res.json(conteggi)
    } catch (errore) {
        console.error("c'è stato un errore nel caricamento del contenuto", errore); 
        res.status(500).json({ errore: "Errore interno del server"})
    }
}