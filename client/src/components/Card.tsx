import type { Raccomandazione } from "../tipi";
import Icona from "./Icona";
import Motivi from "./Motivi";
import Poster from "./Poster";

interface Props {
  raccomandazione: Raccomandazione;
  onSegnaVisto: (id: string, valutazione: number) => void;
  onApri: (id: string) => void;
  inInvio: boolean;
}

function Card({ raccomandazione, onSegnaVisto, inInvio, onApri }: Props) {
  const {
    id,
    titolo,
    tipo,
    anno,
    generi,
    piattaforme,
    posterUrl,
    votoMedio,
    compatibilita,
    motivi,
  } = raccomandazione;

  return (
    <article className="consiglio">
      <button
        className="apri-scheda"
        aria-label="Vedi i dettagli del poster"
        onClick={() => onApri(id)}
      >
        <Poster
          className="consiglio__poster"
          titolo={titolo}
          posterUrl={posterUrl}
          etichetta={`${compatibilita}% match`}
        />
      </button>
      <div className="consiglio__corpo">
        <h3 className="consiglio__titolo">{titolo}</h3>
        <p className="meta">
          <span className="meta__tipo">{tipo}</span> · {anno} ·{" "}
          <Icona nome="stella" dimensione={11} className="meta__stella" />{" "}
          {votoMedio.toFixed(1)}
        </p>
        <p className="consiglio__generi">{generi.join(", ")}</p>
        <Motivi motivi={motivi} />
        {piattaforme.length > 0 ? (
          <p className="consiglio__piattaforme meta">
            {piattaforme.join(" · ")}
          </p>
        ) : (
          <p className="consiglio__piattaforme meta">
            Non disponibile in streaming
          </p>
        )}
      </div>

      <div className="consiglio__azioni">
        <button
          type="button"
          disabled={inInvio}
          onClick={() => onSegnaVisto(id, 4)}
        >
          <Icona nome="pollice-su" dimensione={15} />
          Mi piace
        </button>
        <button
          type="button"
          disabled={inInvio}
          onClick={() => onSegnaVisto(id, 2)}
        >
          <Icona nome="pollice-giu" dimensione={15} />
          Non fa per me
        </button>
      </div>
    </article>
  );
}

export default Card;
