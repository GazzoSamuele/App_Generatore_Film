import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { getRaccomandazioni } from "../controllers/raccomandazioniController.js";
import {
  listaUtenti,
  dettaglioUtente,
  creaUtente,
  aggiungiVisione,
  aggiornaPreferenze,
  rimuoviVisione,
} from "../controllers/utentiController.js";
import {
  listaGeneri,
  listaFilm,
  dettaglioFilm,
} from "../controllers/filmController.js";

const limiteNuoviProfili = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { errore: "Hai creato troppi profili: riprova tra un po'" },
});

const limiteVoti = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { errore: "Hai creato troppi voti: riprova tra un po'" },
});

const router = Router();

router.get("/utenti", listaUtenti);
router.get("/utenti/:utenteId", dettaglioUtente);
router.post("/utenti", limiteNuoviProfili, creaUtente);
router.get("/raccomandazioni/:utenteId", getRaccomandazioni);
router.post("/utenti/:utenteId/visioni", limiteVoti, aggiungiVisione);
router.delete("/utenti/:utenteId/visioni/:filmId", limiteVoti, rimuoviVisione);
router.put("/utenti/:utenteId/preferenze", limiteVoti, aggiornaPreferenze);
router.get("/generi", listaGeneri);
router.get("/film", listaFilm);
router.get("/film/:filmId", dettaglioFilm);

export default router;
