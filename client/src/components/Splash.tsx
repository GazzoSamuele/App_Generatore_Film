import { useEffect, useState } from "react";
import type { Raccomandazione, UtenteRiassunto } from "../tipi";
import Icona from "./Icona";
import Poster from "./Poster";

interface Props {
  utenteId: string;
  nomeUtente: string;
  onScegliPerMe: () => void;
  onScegliGeneri: () => void;
  onEsplora: () => void;
  onUtenteNonValido: () => void;
}

const CARTE_MAZZO = [
  "mazzo__carta--sinistra",
  "mazzo__carta--destra",
  "mazzo__carta--davanti",
];

function Splash({
  utenteId,
  onScegliPerMe,
  onScegliGeneri,
  onEsplora,
  onUtenteNonValido,
}: Props) {
  const [generi, setGeneri] = useState<string[] | null>(null);
  const [anteprima, setAnteprima] = useState<Raccomandazione[]>([]);

  useEffect(() => {
    let attivo = true;

    async function carica() {
      try {
        const [rispostaUtente, rispostaConsigli] = await Promise.all([
          fetch(`/api/utenti/${utenteId}`),
          fetch(`/api/raccomandazioni/${utenteId}`),
        ]);
        if (!attivo) return;

        if (rispostaConsigli.status === 404) {
          onUtenteNonValido();
          return;
        }

        if (rispostaUtente.ok) {
          const utente: UtenteRiassunto = await rispostaUtente.json();
          if (attivo) {
            setGeneri(utente.generiPreferiti);
          }
        }

        if (rispostaConsigli.ok) {
          const dati = await rispostaConsigli.json();
          if (attivo) setAnteprima(dati.raccomandazioni.slice(0, 3));
        }
      } catch (errore) {
        console.error("Errore nel caricamento della home:", errore);
      }
    }

    carica();
    return () => {
      attivo = false;
    };
  }, [utenteId, onUtenteNonValido]);

  const carteMazzo = [anteprima[1], anteprima[2], anteprima[0]];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__testo">
          <h1 className="hero__titolo">
            Il film <em>giusto</em>, senza scorrere per ore.
          </h1>
          <p className="hero__descrizione">
            Ti consigliamo film e serie in base ai generi che ami e a quello che
            hai già visto. E ti diciamo sempre perché.
          </p>

          <div className="hero__azioni">
            <button
              type="button"
              className="pulsante pulsante--primario pulsante--grande"
              onClick={onScegliPerMe}
            >
              Scegli per me
              <Icona nome="freccia" dimensione={20} />
            </button>
            <button type="button" className="link" onClick={onEsplora}>
              oppure sfoglia tutto il catalogo
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mazzo"
          onClick={onScegliPerMe}
          aria-label="Vedi i consigli scelti per te"
        >
          {carteMazzo.map((consiglio, indice) =>
            consiglio ? (
              <Poster
                key={consiglio.id}
                className={`mazzo__carta ${CARTE_MAZZO[indice]}`}
                titolo={consiglio.titolo}
                posterUrl={consiglio.posterUrl}
                etichetta={
                  indice === 2 ? `${consiglio.compatibilita}% match` : undefined
                }
              />
            ) : (
              <span
                key={`vuota-${indice}`}
                className={`mazzo__carta mazzo__carta--vuota ${CARTE_MAZZO[indice]}`}
              />
            ),
          )}
        </button>
      </section>

      <section className="scorciatoie" aria-label="Scorciatoie">
        <article className="scorciatoia">
          <span className="scorciatoia__icona">
            <Icona nome="cerca" />
          </span>
          <h2 className="scorciatoia__titolo">Esplora il catalogo</h2>
          <p className="scorciatoia__testo">
            Cerca per titolo, filtra per genere e scegli tra film e serie.
          </p>
          <button
            type="button"
            className="scorciatoia__link"
            onClick={onEsplora}
          >
            Apri il catalogo
            <Icona nome="freccia" dimensione={16} />
          </button>
        </article>

        <article className="scorciatoia">
          <span className="scorciatoia__icona">
            <Icona nome="cuore" />
          </span>
          <h2 className="scorciatoia__titolo">I tuoi generi</h2>
          {generi !== null &&
            (generi.length > 0 ? (
              <ul className="scorciatoia__generi">
                {generi.map((genere) => (
                  <li key={genere} className="chip chip--piccolo">
                    {genere}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="scorciatoia__testo">
                Non hai ancora scelto nessun genere: i primi consigli partono da
                qui.
              </p>
            ))}
          <button
            type="button"
            className="scorciatoia__link"
            onClick={onScegliGeneri}
          >
            {generi && generi.length > 0
              ? "Modifica generi"
              : "Scegli i generi"}
            <Icona nome="freccia" dimensione={16} />
          </button>
        </article>

        <article className="scorciatoia scorciatoia--tratteggiata">
          <span className="scorciatoia__icona">
            <Icona nome="pollice-su" />
          </span>
          <h2 className="scorciatoia__titolo">Più voti, consigli migliori</h2>
          <p className="scorciatoia__testo">
            Su ogni consiglio tocca «Mi piace» o «Non fa per me»: il tuo profilo
            impara dai voti e la lista si aggiorna.
          </p>
        </article>
      </section>
    </div>
  );
}

export default Splash;
