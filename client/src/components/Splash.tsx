import { useState } from "react";

interface Props {
  nomeUtente: string;
  onScegliPerMe: () => void;
  onScegliGeneri: () => void;
  onCambiaUtente: () => void;
}

function Splash({ nomeUtente, onScegliPerMe, onScegliGeneri, onCambiaUtente }: Props) {

  const [messaggio, setMessaggio] = useState<string | null>(null);
  return (
    <div className="splash">
      <h1 className="splash__title">Ciao {nomeUtente}, benvenuto in MovieMatch!</h1>
      <p className="splash__subtitle">Scopri i film che ti piacciono di più</p>

      <button className="splash__button" onClick={onScegliPerMe}>Scegli per me</button>
      <button className="splash__button" onClick={() => setMessaggio("Funzione non disponibile nella demo dell'applicazione")}>Esplora tutti i film</button>
      <button className="splash__button" onClick={onScegliGeneri}>Scegli i tuoi generi preferiti</button>

      {messaggio && <p className="splash__messaggio">{messaggio}</p>}

      <button className="splash__cambia-utente" onClick={onCambiaUtente}>
        Non sei {nomeUtente}? Cambia profilo
      </button>

    </div>
  );
}

export default Splash;
