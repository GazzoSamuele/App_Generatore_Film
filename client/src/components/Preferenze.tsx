import { useEffect, useState } from "react";
import { leggiErrore } from "../api";

interface Props {
  utenteId: string;
  onSalvato: () => void;
  onIndietro: () => void;
  onUtenteNonValido: () => void;
}

function Preferenze({ utenteId, onSalvato, onIndietro, onUtenteNonValido }: Props) {
  const [generi, setGeneri] = useState<{ genere: string; quanti: number }[]>([])
  const [selezionati, setSelezionati] = useState<string[]>([]);
  const [inInvio, setInInvio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  function alterna(genere: string) {
    setSelezionati((precedenti) =>
      precedenti.includes(genere)
        ? precedenti.filter((g) => g !== genere)
        : [...precedenti, genere]
    );
  }

  async function caricaGeneri() {
    try{
        const risposta = await fetch(`/api/generi`);
        if (!risposta.ok) {
          throw new Error(await leggiErrore(risposta, `Errore ${risposta.status}`));
        }
        const dati = await risposta.json();
        setGeneri(dati)
        setErrore(null);
    } catch (errore) {
        console.error("Errore nel caricamento dei generi:", errore);
        setErrore("Non riesco a caricare i generi. Controlla che il server sia avviato.");
    }
  }

  async function salva() {
    try{
        setInInvio(true);
        setErrore(null);
        const risposta = await fetch(`/api/utenti/${utenteId}/preferenze`, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ generiPreferiti: selezionati})
        });

        if (risposta.status === 404) {
          onUtenteNonValido();
          return;
        }

        if (!risposta.ok) {
          setErrore(
            await leggiErrore(risposta, `Errore ${risposta.status} nel salvataggio delle preferenze`)
          );
          return;
        }

        onSalvato();
    }   catch (errore) {
        console.error("Errore nel salvataggio delle preferenze:", errore);
        setErrore("Non riesco a contattare il server. Riprova.");
    }   finally {
        setInInvio(false)
    }
  }

  useEffect(() => {
    caricaGeneri();
  }, []);

  return (
    <div className="preferenze">
      <button type="button" className="lista__indietro" onClick={onIndietro}>
        Indietro
      </button>

      <h1 className="preferenze__titolo">Cosa ti piace guardare?</h1>
      <p className="preferenze__sottotitolo">
        Scegli i generi che preferisci: li useremo per i primi consigli.
      </p>

      {errore && <p className="preferenze__errore">{errore}</p>}

      <div className="preferenze__generi">
        {generi.map((g) => (
          <button
            key={g.genere}
            type="button"
            className={
              selezionati.includes(g.genere) ? "genere genere--attivo" : "genere"
            }
            onClick={() => alterna(g.genere)}
          >
            {g.genere} ({g.quanti})
          </button>
        ))}
      </div>

      <button
        type="button"
        className="preferenze__salva"
        disabled={selezionati.length === 0 || inInvio}
        onClick={salva}
      >
        {inInvio ? "Salvataggio..." : `Salva (${selezionati.length})`}
      </button>
    </div>
  );
}

export default Preferenze;
