import { useState } from 'react';
import Splash from './components/Splash';
import ListaConsigli from './components/ListaConsigli';
import Preferenze from './components/Preferenze';
import SelezionaUtente from './components/SelezionaUtente';
import {
  leggiUtente,
  salvaUtente,
  dimenticaUtente,
  type UtenteCorrente,
} from './utenteCorrente';
import './App.scss'

type Schermata = "splash" | "preferenze" | "consigli";

function App() {
  const [utente, setUtente] = useState<UtenteCorrente | null>(() => leggiUtente());
  const [schermata, setSchermata] = useState<Schermata>("splash");
  const [avviso, setAvviso] = useState<string | null>(null);

  function selezionaUtente(scelto: UtenteCorrente) {
    salvaUtente(scelto);
    setUtente(scelto);
    setAvviso(null);
    setSchermata("splash");
  }

  function cambiaUtente() {
    dimenticaUtente();
    setUtente(null);
    setSchermata("splash");
  }

  // Il profilo salvato nel browser non esiste più sul server: succede dopo un
  // "npm run seed", che ricrea gli utenti con id nuovi.
  function utenteNonValido() {
    dimenticaUtente();
    setUtente(null);
    setSchermata("splash");
    setAvviso("Il profilo salvato non esiste più sul server. Scegline uno dall'elenco.");
  }

  if (!utente) {
    return (
      <div className="App">
        <SelezionaUtente onSelezionato={selezionaUtente} messaggioIniziale={avviso} />
      </div>
    );
  }

  return (
    <div className="App">
      {schermata === "splash" && (
        <Splash
          nomeUtente={utente.nome}
          onScegliPerMe={() => setSchermata("consigli")}
          onScegliGeneri={() => setSchermata("preferenze")}
          onCambiaUtente={cambiaUtente}
        />
      )}
      {schermata === "consigli" && (
        <ListaConsigli
          utenteId={utente.id}
          onIndietro={() => setSchermata("splash")}
          onUtenteNonValido={utenteNonValido}
        />
      )}
      {schermata === "preferenze" && (
        <Preferenze
          utenteId={utente.id}
          onSalvato={() => setSchermata("consigli")}
          onIndietro={() => setSchermata("splash")}
          onUtenteNonValido={utenteNonValido}
        />
      )}
    </div>
  );
}

export default App
