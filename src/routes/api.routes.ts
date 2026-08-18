import { Router } from "express";
import { getRaccomandazioni } from "../controllers/raccomandazioniController.js";
import { listaUtenti, aggiungiVisione, aggiornaPreferenze } from "../controllers/utentiController.js";
import { listaGeneri } from "../controllers/filmController.js";

const router = Router();

router.get("/utenti", listaUtenti);
router.get("/raccomandazioni/:utenteId", getRaccomandazioni);
router.post("/utenti/:utenteId/visioni", aggiungiVisione);
router.get("/generi", listaGeneri);
router.put("/utenti/:utenteId/preferenze", aggiornaPreferenze);

export default router;
