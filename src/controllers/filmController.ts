import { Film } from "../models/Film.js";
import type { Response, Request } from "express";

export async function listaGeneri(req: Request, res: Response) {
    try{ 
        const generi = (await Film.distinct("generi")).sort();
        res.json(generi)
    } catch (errore) {
        console.error("c'è stato un errore nel caricamento del contenuto", errore); 
        res.status(500).json({ errore: "Errore interno del server"})
    }
}