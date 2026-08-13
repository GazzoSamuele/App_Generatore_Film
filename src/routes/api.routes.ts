import { Router } from "express";
import { getRaccomandazioni } from "../controllers/raccomandazioniController.js";
import { listaUtenti, aggiungiVisione } from "../controllers/utentiController.js";

const router = Router();

router.get("/utenti", listaUtenti);
router.get("/raccomandazioni/:utenteId", getRaccomandazioni);
router.post("/utenti/:utenteId/visioni", aggiungiVisione);

export default router;
