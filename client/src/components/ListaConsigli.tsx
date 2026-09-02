import { useEffect, useState } from "react";
import type { Raccomandazione } from "../tipi";
import Card from "./Card";
import { leggiErrore } from "../api";


type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; dati: Raccomandazione[] };

type Props = {
  utenteId: string;
  onIndietro: () => void;
  onUtenteNonValido: () => void;
};

function ListaConsigli({ utenteId, onIndietro, onUtenteNonValido }: Props) {
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });
  const [inInvio, setInInvio] = useState(false);
  const [erroreVoto, setErroreVoto] = useState<string | null>(null);

  async function carica() {
    try {
      const risposta = await fetch(`/api/raccomandazioni/${utenteId}`);

      if (risposta.status === 404) {
        onUtenteNonValido();
        return;
      }

      if (!risposta.ok) {
        throw new Error(await leggiErrore(risposta, `Errore ${risposta.status}`));
      }

      const dati = await risposta.json();
      setStato({ fase: "pronto", dati: dati.raccomandazioni });
    } catch (errore) {
      setStato({
        fase: "errore",
        messaggio: "Errore nel caricamento delle raccomandazioni",
      });
      console.error(errore);
    }
  }

  async function segnaVisto(id: string, valutazione: number) {
    try {
      setInInvio(true);
      setErroreVoto(null);

      const risposta = await fetch(`/api/utenti/${utenteId}/visioni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filmId: id, valutazione }),
      });

      if (risposta.status === 404) {
        onUtenteNonValido();
        return;
      }

      if (!risposta.ok) {
        setErroreVoto(
          await leggiErrore(risposta, `Errore ${risposta.status} nel salvataggio del voto`)
        );
        return;
      }

      await carica();
    } catch (errore) {
      console.error("Errore nel segnare come visto:", errore);
      setErroreVoto("Non riesco a contattare il server. Riprova.");
    } finally {
      setInInvio(false);
    }
  }

  useEffect(() => {
    carica();
  }, [utenteId]);

  if (stato.fase === "caricamento") return <p>Caricamento…</p>;
  if (stato.fase === "errore") return <p>{stato.messaggio}</p>;

  return (
    <div className="lista">
      <button className="lista__indietro" onClick={onIndietro}>Indietro</button>
          <h1 className="lista__titolo">Ecco i film che ti consigliamo</h1>
          <p className="lista__sottotitolo">
            Puoi segnare i film come "Mi è piaciuto" o "Non mi è piaciuto" per
            migliorare i consigli futuri.
          </p>

      {erroreVoto && <p className="lista__errore">{erroreVoto}</p>}

      <div className="lista__griglia">
        {stato.dati.map((r) => (
          <Card key={r.id} raccomandazione={r} onSegnaVisto={segnaVisto} inInvio={inInvio} />
        ))}
      </div>
    </div>
  );
}

export default ListaConsigli;
