import { useEffect, useState } from "react";
import type { FilmCatalogo } from "../tipi";
import { leggiErrore } from "../api";
import Icona from "./Icona";
import Poster from "./Poster";
import SchedaFilm from "./SchedaFilm";

type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; film: FilmCatalogo[]; totale: number; perPagina: number };

type Tipo = "" | "film" | "serie";

const RITARDO_RICERCA_MS = 300;

const TIPI: { valore: Tipo; etichetta: string }[] = [
  { valore: "", etichetta: "Tutti" },
  { valore: "film", etichetta: "Film" },
  { valore: "serie", etichetta: "Serie" },
];

function EsploraFilm() {
  const [ricerca, setRicerca] = useState("");
  const [ricercaAttiva, setRicercaAttiva] = useState("");
  const [genere, setGenere] = useState("");
  const [tipo, setTipo] = useState<Tipo>("");
  const [pagina, setPagina] = useState(1);
  const [filmAperto, setFilmAperto] = useState<string | null>(null);
  const [tentativo, setTentativo] = useState(0);
  const [generi, setGeneri] = useState<{ genere: string; quanti: number }[]>(
    [],
  );
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setRicercaAttiva(ricerca.trim());
      setPagina(1);
    }, RITARDO_RICERCA_MS);
    return () => clearTimeout(timer);
  }, [ricerca]);

  function scegliGenere(nuovo: string) {
    setGenere(nuovo);
    setPagina(1);
  }

  function scegliTipo(nuovo: Tipo) {
    setTipo(nuovo);
    setPagina(1);
  }

  function cambiaPagina(nuova: number) {
    setPagina(nuova);
    const movimentoRidotto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: movimentoRidotto ? "auto" : "smooth" });
  }

  useEffect(() => {
    let attivo = true;

    async function carica() {
      setStato({ fase: "caricamento" });
      try {
        const parametri = new URLSearchParams({ pagina: String(pagina) });
        if (ricercaAttiva) parametri.set("ricerca", ricercaAttiva);
        if (genere) parametri.set("genere", genere);
        if (tipo) parametri.set("tipo", tipo);

        const risposta = await fetch(`/api/film?${parametri}`);
        if (!risposta.ok) {
          throw new Error(
            await leggiErrore(risposta, `Errore ${risposta.status}`),
          );
        }

        const dati = await risposta.json();
        if (!attivo) return;
        setStato({
          fase: "pronto",
          film: dati.film,
          totale: dati.totale,
          perPagina: dati.perPagina,
        });
      } catch (errore) {
        console.error("Errore nel caricamento del catalogo:", errore);
        if (attivo) {
          setStato({
            fase: "errore",
            messaggio:
              "Non riesco a caricare il catalogo: il server potrebbe essere ancora in avvio.",
          });
        }
      }
    }

    carica();
    return () => {
      attivo = false;
    };
  }, [pagina, ricercaAttiva, genere, tipo, tentativo]);

  useEffect(() => {
    let attivo = true;

    async function caricaGeneri() {
      try {
        const risposta = await fetch("/api/generi");
        if (!risposta.ok) return;
        const dati = await risposta.json();
        if (attivo) setGeneri(dati);
      } catch (errore) {
        console.error("Errore nel caricamento dei generi:", errore);
      }
    }

    caricaGeneri();
    return () => {
      attivo = false;
    };
  }, [tentativo]);

  const totalePagine =
    stato.fase === "pronto"
      ? Math.max(1, Math.ceil(stato.totale / stato.perPagina))
      : 1;

  return (
    <section className="catalogo">
      <header className="intro">
        <p className="occhiello">Catalogo</p>
        <h1 className="intro__titolo intro__titolo--pagina">Esplora tutto</h1>
      </header>

      <div className="catalogo__filtri">
        <label className="ricerca">
          <Icona nome="cerca" dimensione={20} className="ricerca__icona" />
          <span className="visivamente-nascosto">Cerca un titolo</span>
          <input
            type="search"
            className="ricerca__input"
            placeholder="Cerca un titolo…"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
        </label>

        <div className="selettore" role="group" aria-label="Tipo di titolo">
          {TIPI.map((t) => (
            <button
              key={t.etichetta}
              type="button"
              className={
                tipo === t.valore
                  ? "selettore__voce selettore__voce--attiva"
                  : "selettore__voce"
              }
              aria-pressed={tipo === t.valore}
              onClick={() => scegliTipo(t.valore)}
            >
              {t.etichetta}
            </button>
          ))}
        </div>
      </div>

      <div className="catalogo__generi" role="group" aria-label="Genere">
        <button
          type="button"
          className={
            genere === ""
              ? "chip chip--filtro chip--attivo"
              : "chip chip--filtro"
          }
          aria-pressed={genere === ""}
          onClick={() => scegliGenere("")}
        >
          Tutti i generi
        </button>
        {generi.map((g) => (
          <button
            key={g.genere}
            type="button"
            className={
              genere === g.genere
                ? "chip chip--filtro chip--attivo"
                : "chip chip--filtro"
            }
            aria-pressed={genere === g.genere}
            onClick={() => scegliGenere(g.genere)}
          >
            {g.genere}
          </button>
        ))}
      </div>

      {stato.fase === "caricamento" && <p className="stato">Caricamento…</p>}
      {stato.fase === "errore" && (
        <div className="stato stato--errore">
          <p>{stato.messaggio}</p>
          <button
            type="button"
            className="pulsante pulsante--secondario"
            onClick={() => setTentativo((t) => t + 1)}
          >
            Riprova
          </button>
        </div>
      )}

      {stato.fase === "pronto" && (
        <p className="catalogo__conteggio meta" aria-live="polite">
          {stato.totale === 1 ? "1 titolo" : `${stato.totale} titoli`}
        </p>
      )}

      {stato.fase === "pronto" && stato.film.length === 0 && (
        <p className="stato">Nessun titolo trovato con questi filtri.</p>
      )}

      {stato.fase === "pronto" && stato.film.length > 0 && (
        <>
          <div className="catalogo__griglia">
            {stato.film.map((f) => (
              <article key={f.id} className="titolo-catalogo">
                <button
                  type="button"
                  className="apri-scheda"
                  aria-label={`Apri la scheda di ${f.titolo}`}
                  onClick={() => setFilmAperto(f.id)}
                >
                  <Poster
                    className="titolo-catalogo__poster"
                    titolo={f.titolo}
                    posterUrl={f.posterUrl}
                    etichetta={
                      <>
                        <Icona nome="stella" dimensione={11} />
                        <span className="poster__voto">
                          {f.votoMedio.toFixed(1)}
                        </span>
                      </>
                    }
                  />
                </button>

                <div className="titolo-catalogo__corpo">
                  <h2 className="titolo-catalogo__titolo">{f.titolo}</h2>
                  <p className="meta">
                    <span className="meta__tipo">{f.tipo}</span> · {f.anno}
                  </p>
                  <p className="titolo-catalogo__generi">
                    {f.generi.join(", ")}
                  </p>
                  {f.piattaforme.length > 0 ? (
                    <p className="titolo-catalogo__piattaforme meta">
                      {f.piattaforme.join(" · ")}
                    </p>
                  ) : (
                    <>
                      <p className="titolo-catalogo__piattaforme meta">
                        Non disponibile in streaming
                      </p>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>

          <nav className="paginazione" aria-label="Pagine del catalogo">
            <button
              type="button"
              className="pulsante pulsante--secondario"
              disabled={pagina <= 1}
              onClick={() => cambiaPagina(pagina - 1)}
            >
              ← Precedente
            </button>
            <span className="paginazione__stato meta">
              Pagina <strong>{pagina}</strong> di {totalePagine}
            </span>
            <button
              type="button"
              className="pulsante pulsante--secondario"
              disabled={pagina >= totalePagine}
              onClick={() => cambiaPagina(pagina + 1)}
            >
              Successiva →
            </button>
          </nav>
        </>
      )}
      {filmAperto && (
        <SchedaFilm filmId={filmAperto} onChiudi={() => setFilmAperto(null)} />
      )}
    </section>
  );
}

export default EsploraFilm;
