import { Film } from "../models/Film.js";
import type { Response, Request } from "express";

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