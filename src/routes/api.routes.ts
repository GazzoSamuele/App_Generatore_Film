import { Router } from "express";
import { getRaccomandazioni } from "../controllers/raccomandazioniController.js";
import {
  listaUtenti,
  creaUtente,
  aggiungiVisione,
  aggiornaPreferenze,
} from "../controllers/utentiController.js";
import { listaGeneri, listaFilm } from "../controllers/filmController.js";

const router = Router();

router.get("/utenti", listaUtenti);
router.post("/utenti", creaUtente);
router.get("/raccomandazioni/:utenteId", getRaccomandazioni);
router.post("/utenti/:utenteId/visioni", aggiungiVisione);
router.get("/generi", listaGeneri);
router.get("/film", listaFilm);
router.put("/utenti/:utenteId/preferenze", aggiornaPreferenze);

export default router;
