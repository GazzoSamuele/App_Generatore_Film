import { Router } from "express";
import { getRaccomandazioni } from "../controllers/raccomandazioniController.js";
import { listaUtenti } from "../controllers/utentiController.js";

const router = Router();

router.get("/utenti", listaUtenti);
router.get("/raccomandazioni/:utenteId", getRaccomandazioni);

export default router;
