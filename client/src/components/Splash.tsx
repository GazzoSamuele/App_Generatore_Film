interface Props {
  nomeUtente: string;
  onScegliPerMe: () => void;
  onScegliGeneri: () => void;
  onEsplora: () => void;
  onCambiaUtente: () => void;
}

function Splash({ nomeUtente, onScegliPerMe, onScegliGeneri, onEsplora, onCambiaUtente }: Props) {

  return (
    <div className="splash">
      <h1 className="splash__title">Ciao {nomeUtente}, benvenuto in MovieMatch!</h1>
      <p className="splash__subtitle">Scopri i film che ti piacciono di più</p>

      <button className="splash__button" onClick={onScegliPerMe}>Scegli per me</button>
      <button className="splash__button" onClick={onEsplora}>Esplora tutti i film</button>
      <button className="splash__button" onClick={onScegliGeneri}>Scegli i tuoi generi preferiti</button>

      <button className="splash__cambia-utente" onClick={onCambiaUtente}>
        Non sei {nomeUtente}? Cambia profilo
      </button>

    </div>
  );
}

export default Splash;
