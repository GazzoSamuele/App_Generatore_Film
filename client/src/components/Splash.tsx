import { useState } from "react";

interface Props {
  onScegliPerMe: () => void;
  onScegliGeneri: () => void;
}

function Splash({ onScegliPerMe, onScegliGeneri }: Props) {

  const [messaggio, setMessaggio] = useState<string | null>(null);
  return (
    <div className="splash">
      <h1 className="splash__title">Benvenuto in MovieMatch!</h1>
      <p className="splash__subtitle">Scopri i film che ti piacciono di più</p>
      
      <button className="splash__button" onClick={onScegliPerMe}>Scegli per me</button>
      <button className="splash__button" onClick={() => setMessaggio("Funzione non disponibile nella demo dell'applicazione")}>Esplora tutti i film</button>
      <button className="splash__button" onClick={onScegliGeneri}>Scegli i tuoi generi preferiti</button>

      {messaggio && <p className="splash__messaggio">{messaggio}</p>}

    </div>
  );
}

export default Splash;

    