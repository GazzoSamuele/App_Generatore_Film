import type { Raccomandazione } from "../tipi";

interface Props {
  raccomandazione: Raccomandazione;
  onSegnaVisto: (id: string, valutazione: number) => void;
}

function Card({ raccomandazione, onSegnaVisto }: Props) {
  return (
    <div className="card">
      <img src={raccomandazione.posterUrl} alt={raccomandazione.titolo} className="card__poster" />
      <div className="card__content">
        <h2 className="card__title">{raccomandazione.titolo}</h2>
        <p className="card__info">
            {raccomandazione.tipo} - {raccomandazione.anno} - {raccomandazione.piattaforma}
        </p>
        <p className="card__genres">{raccomandazione.generi.join(", ")}</p>
        <p className="card__score">Voto medio: {raccomandazione.votoMedio.toFixed(1)} - Compatibilità: {raccomandazione.compatibilita}%</p>
        <ul className="card__reasons">
            {raccomandazione.motivi.map((motivo, index) => (
                <li key={index}>{motivo}</li>
            ))}
        </ul>
        <p className="card__final-score">Punteggio finale: {raccomandazione.punteggio.toFixed(1)}</p>
      </div>

      <button onClick={() => onSegnaVisto(raccomandazione.id, 4)}>Mi è piaciuto</button>
      <button onClick={() => onSegnaVisto(raccomandazione.id, 2)}>Non mi è piaciuto</button>
    </div>
  );
}

export default Card;
