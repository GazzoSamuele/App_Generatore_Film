import { useEffect, useState } from "react";
import type { FilmCatalogo } from "../tipi";
import { leggiErrore } from "../api";

interface Props {
  onIndietro: () => void;
}

type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; film: FilmCatalogo[]; totale: number; perPagina: number };

const RITARDO_RICERCA_MS = 300;

function EsploraFilm({ onIndietro }: Props) {
  const [ricerca, setRicerca] = useState("");
  const [ricercaAttiva, setRicercaAttiva] = useState("");
  const [genere, setGenere] = useState("");
  const [tipo, setTipo] = useState<"" | "film" | "serie">("");
  const [pagina, setPagina] = useState(1);
  const [generi, setGeneri] = useState<{ genere: string; quanti: number }[]>([]);
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });

  // Aspetta che l'utente finisca di digitare prima di interrogare il server,
  // così non parte una richiesta a ogni singolo tasto premuto.
  useEffect(() => {
    const timer = setTimeout(() => setRicercaAttiva(ricerca.trim()), RITARDO_RICERCA_MS);
    return () => clearTimeout(timer);
  }, [ricerca]);

  // Cambiare un filtro deve sempre far ripartire dalla prima pagina.
  useEffect(() => {
    setPagina(1);
  }, [ricercaAttiva, genere, tipo]);

  useEffect(() => {
    async function carica() {
      setStato({ fase: "caricamento" });
      try {
        const parametri = new URLSearchParams({ pagina: String(pagina) });
        if (ricercaAttiva) parametri.set("ricerca", ricercaAttiva);
        if (genere) parametri.set("genere", genere);
        if (tipo) parametri.set("tipo", tipo);

        const risposta = await fetch(`/api/film?${parametri}`);
        if (!risposta.ok) {
          throw new Error(await leggiErrore(risposta, `Errore ${risposta.status}`));
        }

        const dati = await risposta.json();
        setStato({
          fase: "pronto",
          film: dati.film,
          totale: dati.totale,
          perPagina: dati.perPagina,
        });
      } catch (errore) {
        console.error("Errore nel caricamento del catalogo:", errore);
        setStato({
          fase: "errore",
          messaggio: "Non riesco a caricare il catalogo. Controlla che il server sia avviato.",
        });
      }
    }

    carica();
  }, [pagina, ricercaAttiva, genere, tipo]);

  useEffect(() => {
    async function caricaGeneri() {
      try {
        const risposta = await fetch("/api/generi");
        if (!risposta.ok) return;
        setGeneri(await risposta.json());
      } catch (errore) {
        console.error("Errore nel caricamento dei generi:", errore);
      }
    }

    caricaGeneri();
  }, []);

  const totalePagine =
    stato.fase === "pronto" ? Math.max(1, Math.ceil(stato.totale / stato.perPagina)) : 1;

  return (
    <div className="catalogo">
      <button type="button" className="lista__indietro" onClick={onIndietro}>
        Indietro
      </button>

      <h1 className="catalogo__titolo">Esplora tutti i film</h1>

      <div className="catalogo__filtri">
        <input
          type="search"
          className="catalogo__ricerca"
          placeholder="Cerca per titolo…"
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
        />

        <select
          className="catalogo__select"
          value={genere}
          onChange={(e) => setGenere(e.target.value)}
        >
          <option value="">Tutti i generi</option>
          {generi.map((g) => (
            <option key={g.genere} value={g.genere}>
              {g.genere} ({g.quanti})
            </option>
          ))}
        </select>

        <select
          className="catalogo__select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "" | "film" | "serie")}
        >
          <option value="">Film e serie</option>
          <option value="film">Solo film</option>
          <option value="serie">Solo serie</option>
        </select>
      </div>

      {stato.fase === "caricamento" && <p className="catalogo__stato">Caricamento…</p>}
      {stato.fase === "errore" && <p className="catalogo__errore">{stato.messaggio}</p>}

      {stato.fase === "pronto" && stato.film.length === 0 && (
        <p className="catalogo__vuoto">Nessun titolo trovato con questi filtri.</p>
      )}

      {stato.fase === "pronto" && stato.film.length > 0 && (
        <>
          <div className="catalogo__griglia">
            {stato.film.map((f) => (
              <div key={f.id} className="catalogo-card">
                <img src={f.posterUrl} alt={f.titolo} className="catalogo-card__poster" />
                <div className="catalogo-card__content">
                  <h2 className="catalogo-card__title">{f.titolo}</h2>
                  <p className="catalogo-card__info">
                    {f.tipo} · {f.anno} · {f.piattaforme.join(", ") || "Nessuna piattaforma"}
                  </p>
                  <p className="catalogo-card__genres">{f.generi.join(", ")}</p>
                  <p className="catalogo-card__score">Voto medio: {f.votoMedio.toFixed(1)}</p>
                  {f.descrizione && (
                    <p className="catalogo-card__description">{f.descrizione}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="catalogo__paginazione">
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              ← Precedente
            </button>
            <span>
              Pagina {pagina} di {totalePagine}
            </span>
            <button
              type="button"
              disabled={pagina >= totalePagine}
              onClick={() => setPagina((p) => p + 1)}
            >
              Successiva →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default EsploraFilm;
