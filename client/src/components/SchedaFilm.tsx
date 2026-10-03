import { useEffect, useRef, useState } from "react";
import type { DettaglioFilm } from "../tipi";
import { leggiErrore } from "../api";
import Poster from "./Poster";
import Icona from "./Icona";

interface Props {
  filmId: string;
  onChiudi: () => void;
}

type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; film: DettaglioFilm };

function Dettagli({ film }: { film: DettaglioFilm }) {
  const durata =
    film.tipo === "serie"
      ? `${film.durataMinuti} min a episodio`
      : `${film.durataMinuti} min`;

  return (
    <div className="scheda__griglia">
      <Poster
        className="scheda__poster"
        titolo={film.titolo}
        posterUrl={film.posterUrl}
      />

      <div>
        <p className="meta">
          <span className="meta__tipo">{film.tipo}</span> · {film.anno}
          {film.durataMinuti > 0 && ` · ${durata}`} ·{" "}
          <Icona nome="stella" dimensione={11} className="meta__stella" />{" "}
          {film.votoMedio.toFixed(1)}
        </p>
        <h2 id="scheda-titolo" className="scheda__titolo">
          {film.titolo}
        </h2>
        <p className="scheda__generi">{film.generi.join(", ")}</p>

        {film.descrizione && (
          <p className="scheda__trama">{film.descrizione}</p>
        )}

        <dl className="scheda__dati">
          {film.regista && (
            <>
              <dt>{film.tipo === "serie" ? "Ideatore" : "Regia"}</dt>
              <dd>{film.regista}</dd>
            </>
          )}
          {film.cast.length > 0 && (
            <>
              <dt>Cast</dt>
              <dd>{film.cast.join(", ")}</dd>
            </>
          )}
          <dt>Dove guardarlo</dt>
          <dd>
            {film.piattaforme.length > 0
              ? film.piattaforme.join(" · ")
              : "Non disponibile in streaming"}
          </dd>
        </dl>
      </div>
    </div>
  );
}

function SchedaFilm({ filmId, onChiudi }: Props) {
  const finestra = useRef<HTMLDialogElement>(null);
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });

  useEffect(() => {
    finestra.current?.showModal();
  }, []);

  useEffect(() => {
    let attivo = true;

    async function carica() {
      try {
        const risposta = await fetch(`/api/film/${filmId}`);
        if (!risposta.ok) {
          throw new Error(
            await leggiErrore(risposta, `Errore ${risposta.status}`),
          );
        }
        const film: DettaglioFilm = await risposta.json();
        if (attivo) setStato({ fase: "pronto", film });
      } catch (errore) {
        console.error("Errore nel caricamento dei film o serie tv:", errore);
        if (attivo) {
          setStato({
            fase: "errore",
            messaggio:
              "Non riesco a caricare questo titolo. Controlla che il server sia avviato.",
          });
        }
      }
    }

    carica();
    return () => {
      attivo = false;
    };
  }, [filmId]);

  function chiudi() {
    finestra.current?.close();
  }

  return (
    <dialog
      ref={finestra}
      className="scheda"
      aria-labelledby="scheda-titolo"
      onClose={onChiudi}
      onClick={(evento) => {
        if (evento.target === finestra.current) chiudi();
      }}
    >
      <div className="scheda__contenuto">
        <button
          type="button"
          className="scheda__chiudi"
          aria-label="Chiudi"
          onClick={chiudi}
        >
          ✕
        </button>

        {stato.fase === "caricamento" && <p className="stato">Caricamento…</p>}
        {stato.fase === "errore" && (
          <p className="stato stato--errore">{stato.messaggio}</p>
        )}
        {stato.fase === "pronto" && <Dettagli film={stato.film} />}
      </div>
    </dialog>
  );
}

export default SchedaFilm;
