import type { Raccomandazione } from "../tipi";

interface Props {
  raccomandazione: Raccomandazione;
  onSegnaVisto: (id: string, valutazione: number) => void;
  inInvio: boolean;
}

function Card({ raccomandazione, onSegnaVisto, inInvio }: Props) {
  return (
    <div className="card">
      <img src={raccomandazione.posterUrl} alt={raccomandazione.titolo} className="card__poster" />
      <div className="card__content">
        <h2 className="card__title">{raccomandazione.titolo}</h2>
        <p className="card__info">
            {raccomandazione.tipo} - {raccomandazione.anno} - {raccomandazione.piattaforme.join(", ")}
        </p>
        <p className="card__genres">{raccomandazione.generi.join(", ")}</p>
        <p className="card__score">Voto medio: {raccomandazione.votoMedio.toFixed(1)} - Compatibilità: {raccomandazione.compatibilita}%</p>
        <ul className="card__reasons">
            {raccomandazione.motivi.map((motivo, index) => (
                <li key={index}>{motivo}</li>
            ))}
        </ul>
      </div>
      <div className="card__azioni">
        <button disabled={inInvio} onClick={() => onSegnaVisto(raccomandazione.id, 4)}>Mi è piaciuto</button>
        <button disabled={inInvio} onClick={() => onSegnaVisto(raccomandazione.id, 2)}>Non mi è piaciuto</button>
      </div>
    </div>
  );
}

export default Card;
