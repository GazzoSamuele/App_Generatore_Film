interface Props {
  onScegliPerMe: () => void;
}

function Splash({ onScegliPerMe }: Props) {
  return (
    <div className="splash">
      <h1 className="splash__title">Benvenuto in MovieMatch!</h1>
      <p className="splash__subtitle">Scopri i film che ti piacciono di più</p>
      
      <button className="splash__button" onClick={onScegliPerMe}>Scegli per me</button>
      <button className="splash__button" onClick={() => alert("Funzione simulata")}>Esplora tutti i film</button>
    </div>
  );
}

export default Splash;

    