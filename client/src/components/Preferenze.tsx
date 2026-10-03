import { useEffect, useState } from "react";
import type { UtenteRiassunto } from "../tipi";
import { leggiErrore } from "../api";
import Icona from "./Icona";

interface Props {
  utenteId: string;
  onSalvato: () => void;
  onUtenteNonValido: () => void;
}

function Preferenze({ utenteId, onSalvato, onUtenteNonValido }: Props) {
  const [generi, setGeneri] = useState<{ genere: string; quanti: number }[]>(
    [],
  );
  const [selezionati, setSelezionati] = useState<string[]>([]);
  const [inInvio, setInInvio] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  function alterna(genere: string) {
    setSelezionati((precedenti) =>
      precedenti.includes(genere)
        ? precedenti.filter((g) => g !== genere)
        : [...precedenti, genere],
    );
  }

  useEffect(() => {
    let attivo = true;

    async function caricaGeneri() {
      try {
        const [rispostaGeneri, rispostaUtente] = await Promise.all([
          fetch(`/api/generi`),
          fetch(`/api/utenti/${utenteId}`),
        ]);
        if (!rispostaGeneri.ok) {
          throw new Error(
            await leggiErrore(
              rispostaGeneri,
              `Errore ${rispostaGeneri.status}`,
            ),
          );
        }
        const generiCatalogo = await rispostaGeneri.json();
        const utente: UtenteRiassunto | null = rispostaUtente.ok
          ? await rispostaUtente.json()
          : null;
        if (!attivo) return;

        setGeneri(generiCatalogo);
        setSelezionati(utente?.generiPreferiti ?? []);
        setErrore(null);
      } catch (errore) {
        console.error("Errore nel caricamento dei generi:", errore);
        if (attivo) {
          setErrore(
            "Non riesco a caricare i generi. Controlla che il server sia avviato.",
          );
        }
      }
    }

    caricaGeneri();
    return () => {
      attivo = false;
    };
  }, [utenteId]);

  async function salva() {
    try {
      setInInvio(true);
      setErrore(null);
      const risposta = await fetch(`/api/utenti/${utenteId}/preferenze`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generiPreferiti: selezionati }),
      });

      if (risposta.status === 404) {
        onUtenteNonValido();
        return;
      }

      if (!risposta.ok) {
        setErrore(
          await leggiErrore(
            risposta,
            `Errore ${risposta.status} nel salvataggio delle preferenze`,
          ),
        );
        return;
      }

      onSalvato();
    } catch (errore) {
      console.error("Errore nel salvataggio delle preferenze:", errore);
      setErrore("Non riesco a contattare il server. Riprova.");
    } finally {
      setInInvio(false);
    }
  }

  const quanti = selezionati.length;

  return (
    <section className="preferenze">
      <header className="intro">
        <p className="occhiello">I tuoi gusti</p>
        <h1 className="intro__titolo">Cosa ti piace guardare?</h1>
        <p className="intro__testo">
          Scegline 2 o 3 per iniziare. Puoi cambiarli quando vuoi: i consigli si
          aggiornano subito.
        </p>
      </header>

      {errore && <p className="errore">{errore}</p>}

      <div className="preferenze__generi">
        {generi.map((g) => {
          const attivo = selezionati.includes(g.genere);
          return (
            <button
              key={g.genere}
              type="button"
              className={attivo ? "genere genere--attivo" : "genere"}
              aria-pressed={attivo}
              onClick={() => alterna(g.genere)}
            >
              {attivo && (
                <span className="genere__spunta">
                  <Icona nome="check" dimensione={14} />
                </span>
              )}
              {g.genere}
              <span className="genere__conteggio">{g.quanti}</span>
            </button>
          );
        })}
      </div>

      <div className="barra-salva">
        <div className="barra-salva__interno">
          <p className="barra-salva__conteggio" aria-live="polite">
            {quanti === 0
              ? "Nessun genere selezionato"
              : quanti === 1
                ? "1 genere selezionato"
                : `${quanti} generi selezionati`}
          </p>
          <button
            type="button"
            className="pulsante pulsante--primario pulsante--grande"
            disabled={quanti === 0 || inInvio}
            onClick={salva}
          >
            {inInvio ? "Salvataggio…" : "Salva e vedi i consigli"}
            {!inInvio && <Icona nome="freccia" dimensione={20} />}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Preferenze;
