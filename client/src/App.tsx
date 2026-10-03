import { useCallback, useEffect, useState } from "react";
import Intestazione, { type Schermata } from "./components/Intestazione";
import Splash from "./components/Splash";
import ListaConsigli from "./components/ListaConsigli";
import Preferenze from "./components/Preferenze";
import SelezionaUtente from "./components/SelezionaUtente";
import EsploraFilm from "./components/EsploraFilm";
import PiePagina from "./components/PiePagina";
import {
  leggiUtente,
  salvaUtente,
  dimenticaUtente,
  aggiungiProfilo,
  rimuoviProfilo,
  type UtenteCorrente,
} from "./utenteCorrente";
import "./App.scss";

function App() {
  const [utente, setUtente] = useState<UtenteCorrente | null>(() => {
    const salvato = leggiUtente();
    if (salvato) aggiungiProfilo(salvato.id);
    return salvato;
  });
  const [schermata, setSchermata] = useState<Schermata>("home");
  const [avviso, setAvviso] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [schermata, utente]);

  function selezionaUtente(scelto: UtenteCorrente, appenaCreato: boolean) {
    salvaUtente(scelto);
    setUtente(scelto);
    setAvviso(null);
    setSchermata(appenaCreato ? "preferenze" : "home");
  }

  function cambiaUtente() {
    dimenticaUtente();
    setUtente(null);
    setSchermata("home");
  }

  const utenteNonValido = useCallback(() => {
    const salvato = leggiUtente();
    if (salvato) rimuoviProfilo(salvato.id);
    dimenticaUtente();
    setUtente(null);
    setSchermata("home");
    setAvviso(
      "Il profilo salvato non esiste più sul server. Scegline uno dall'elenco.",
    );
  }, []);

  if (!utente) {
    return (
      <>
        <Intestazione utente={null} />
        <main className="pagina">
          <SelezionaUtente
            onSelezionato={selezionaUtente}
            messaggioIniziale={avviso}
          />
        </main>
        <PiePagina />
      </>
    );
  }

  return (
    <>
      <Intestazione
        utente={utente}
        schermata={schermata}
        onNaviga={setSchermata}
        onCambiaUtente={cambiaUtente}
      />
      <main className="pagina">
        {schermata === "home" && (
          <Splash
            utenteId={utente.id}
            nomeUtente={utente.nome}
            onScegliPerMe={() => setSchermata("consigli")}
            onScegliGeneri={() => setSchermata("preferenze")}
            onEsplora={() => setSchermata("esplora")}
            onUtenteNonValido={utenteNonValido}
          />
        )}
        {schermata === "consigli" && (
          <ListaConsigli
            utenteId={utente.id}
            nomeUtente={utente.nome}
            onUtenteNonValido={utenteNonValido}
          />
        )}
        {schermata === "preferenze" && (
          <Preferenze
            utenteId={utente.id}
            onSalvato={() => setSchermata("consigli")}
            onUtenteNonValido={utenteNonValido}
          />
        )}
        {schermata === "esplora" && <EsploraFilm />}
      </main>
      <PiePagina />
    </>
  );
}

export default App;
