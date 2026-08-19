import { useEffect, useState } from "react";
import { UTENTE_ID } from "../config";

interface Props {
  onSalvato: () => void;
}

function Preferenze({ onSalvato }: Props) {
  const [generi, setGeneri] = useState<{ genere: string; quanti: number }[]>([])  
  const [selezionati, setSelezionati] = useState<string[]>([]);
  const [inInvio, setInInvio] = useState(false);

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
        if (!risposta.ok) throw new Error(`Errore nel caricamento dei generi`);
        const dati = await risposta.json();
        setGeneri(dati)
    } catch (errore) {
        console.error("Errore nel caricamento dei generi:", errore);
    }
  }

  async function salva() {
    try{
        setInInvio(true);
        const risposta = await fetch(`/api/utenti/${UTENTE_ID}/preferenze`, {
            method: "PUT",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ generiPreferiti: selezionati})
        });

        if(!risposta.ok) throw new Error(`Errore ${risposta.status} nel salvataggio delle preferenze`)
        onSalvato();
    }   catch (errore) {
        console.error("Errore nel salvataggio delle preferenze:", errore);
    }   finally {
        setInInvio(false)
    }
  }

  useEffect(() => {
    caricaGeneri();
  }, []);

  return (
    <div className="preferenze">
      <h1 className="preferenze__titolo">Cosa ti piace guardare?</h1>
      <p className="preferenze__sottotitolo">
        Scegli i generi che preferisci: li useremo per i primi consigli.
      </p>

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
