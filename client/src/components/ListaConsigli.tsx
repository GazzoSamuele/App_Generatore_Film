import { useEffect, useState } from "react";
import type { Raccomandazione } from "../tipi";
import Card from "./Card";
import { UTENTE_ID } from "../config";


type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; dati: Raccomandazione[] };

type Props = {
  onIndietro: () => void
};
function ListaConsigli({ onIndietro }: Props) {
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });
  const [inInvio, setInInvio] = useState(false);

  async function carica() {
    try {
      const risposta = await fetch(`/api/raccomandazioni/${UTENTE_ID}`);
      if (!risposta.ok) throw new Error(`Errore ${risposta.status}`);
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
      const risposta = await fetch(`/api/utenti/${UTENTE_ID}/visioni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filmId: id, valutazione }),
      });

      if (!risposta.ok) throw new Error(`Errore ${risposta.status}`);

      await carica();
    } catch (errore) {
      console.error("Errore nel segnare come visto:", errore);
    } finally {
      setInInvio(false);
    }
  }

  useEffect(() => {
    carica();
  }, []);

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
      <div className="lista__griglia">
        {stato.dati.map((r) => (
          <Card key={r.titolo} raccomandazione={r} onSegnaVisto={segnaVisto} inInvio={inInvio} />
        ))}
      </div>
    </div>
  );
}

export default ListaConsigli;
