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

function ConsiglioInEvidenza({
  raccomandazione,
  onSegnaVisto,
  onApri,
  inInvio,
}: Props) {
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
    <article className="evidenza">
      <button
        className="apri-scheda"
        aria-label="Vedi i dettagli del poster"
        onClick={() => onApri(id)}
      >
        <Poster
          className="evidenza__poster"
          titolo={titolo}
          posterUrl={posterUrl}
        />
      </button>
      <div className="evidenza__corpo">
        <span className="badge">Il più adatto a te</span>
        <h2 className="evidenza__titolo">{titolo}</h2>
        <p className="meta">
          <span className="meta__tipo">{tipo}</span> · {anno} ·{" "}
          {generi.join(", ")}
        </p>

        <div className="evidenza__punteggi">
          <div className="compatibilita">
            <p>
              <span className="compatibilita__valore">{compatibilita}%</span>
              <span className="compatibilita__etichetta">compatibilità</span>
            </p>
            <span className="compatibilita__barra" aria-hidden="true">
              <span style={{ width: `${compatibilita}%` }} />
            </span>
          </div>

          <div className="voto">
            <p className="voto__valore">
              <Icona nome="stella" dimensione={20} />
              {votoMedio.toFixed(1)}
            </p>
            <p className="voto__etichetta">voto medio</p>
          </div>
        </div>

        <p className="etichetta-sezione">Perché te lo consigliamo</p>
        <Motivi motivi={motivi} grandi />

        {piattaforme.length > 0 ? (
          <>
            <p className="etichetta-sezione">Dove guardarlo</p>
            <ul className="evidenza__piattaforme">
              {piattaforme.map((piattaforma) => (
                <li key={piattaforma} className="chip chip--bordato">
                  {piattaforma}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="etichetta-sezione">Dove guardarlo</p>
            <p className="meta">Non disponibile in streaming</p>
          </>
        )}

        <div className="evidenza__azioni">
          <button
            type="button"
            className="pulsante pulsante--secondario"
            disabled={inInvio}
            onClick={() => onSegnaVisto(id, 4)}
          >
            <Icona nome="pollice-su" dimensione={17} />
            Mi è piaciuto
          </button>
          <button
            type="button"
            className="pulsante pulsante--secondario"
            disabled={inInvio}
            onClick={() => onSegnaVisto(id, 2)}
          >
            <Icona nome="pollice-giu" dimensione={17} />
            Non fa per me
          </button>
        </div>
      </div>
    </article>
  );
}

export default ConsiglioInEvidenza;
