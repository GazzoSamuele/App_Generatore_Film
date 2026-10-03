import { useEffect, useRef, useState, type SubmitEvent } from "react";
import type { UtenteRiassunto } from "../tipi";
import type { UtenteCorrente } from "../utenteCorrente";
import { leggiProfili, aggiungiProfilo } from "../utenteCorrente";
import { leggiErrore } from "../api";
import { classeAvatar, iniziale } from "../colori";
import Icona from "./Icona";

interface Props {
  onSelezionato: (utente: UtenteCorrente, appenaCreato: boolean) => void;
  messaggioIniziale?: string | null;
}

type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; utenti: UtenteRiassunto[] };

function SelezionaUtente({ onSelezionato, messaggioIniziale }: Props) {
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });
  const [mostraForm, setMostraForm] = useState(false);
  const [nome, setNome] = useState("");
  const [erroreForm, setErroreForm] = useState<string | null>(null);
  const [inInvio, setInInvio] = useState(false);
  const campoNome = useRef<HTMLInputElement>(null);
  // Incrementarlo fa ripartire il caricamento dei profili (pulsante "Riprova").
  const [tentativo, setTentativo] = useState(0);

  useEffect(() => {
    let attivo = true;

    async function caricaUtenti() {
      try {
        const risposta = await fetch(
          `/api/utenti?ids=${leggiProfili().join(",")}`,
        );
        if (!risposta.ok) {
          throw new Error(
            await leggiErrore(risposta, `Errore ${risposta.status}`),
          );
        }

        const utenti: UtenteRiassunto[] = await risposta.json();
        if (!attivo) return;
        setStato({ fase: "pronto", utenti });
        setMostraForm(utenti.length === 0);
      } catch (errore) {
        console.error("Errore nel caricamento dei profili:", errore);
        if (attivo) {
          setStato({
            fase: "errore",
            messaggio:
              "Non riesco a caricare i profili. Controlla che il server sia avviato e riprova.",
          });
        }
      }
    }

    caricaUtenti();
    return () => {
      attivo = false;
    };
  }, [tentativo]);

  function riprova() {
    setStato({ fase: "caricamento" });
    setTentativo((t) => t + 1);
  }

  async function creaUtente(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErroreForm(null);
    setInInvio(true);

    try {
      const risposta = await fetch("/api/utenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!risposta.ok) {
        setErroreForm(
          await leggiErrore(
            risposta,
            `Errore ${risposta.status} nella creazione del profilo`,
          ),
        );
        return;
      }

      const creato: UtenteRiassunto = await risposta.json();
      aggiungiProfilo(creato._id);
      onSelezionato({ id: creato._id, nome: creato.nome }, true);
    } catch (errore) {
      console.error("Errore nella creazione del profilo:", errore);
      setErroreForm("Non riesco a contattare il server. Riprova.");
    } finally {
      setInInvio(false);
    }
  }

  function apriForm() {
    setMostraForm(true);
    campoNome.current?.focus();
  }

  useEffect(() => {
    if (mostraForm) campoNome.current?.focus();
  }, [mostraForm]);

  return (
    <section className="profili">
      <header className="intro">
        <p className="occhiello">Passo 1 · Scegli il profilo</p>
        <h1 className="intro__titolo">Chi sta guardando?</h1>
        <p className="intro__testo">
          Ogni profilo ha i suoi gusti: i consigli vengono calcolati su chi lo
          usa.
        </p>
      </header>

      {messaggioIniziale && <p className="avviso">{messaggioIniziale}</p>}

      {stato.fase === "caricamento" && (
        <p className="stato">Caricamento dei profili…</p>
      )}

      {stato.fase === "errore" && (
        <div className="stato stato--errore">
          <p>{stato.messaggio}</p>
          <button
            type="button"
            className="pulsante pulsante--secondario"
            onClick={riprova}
          >
            Riprova
          </button>
        </div>
      )}

      {stato.fase === "pronto" && (
        <>
          <ul className="profili__griglia">
            {stato.utenti.map((utente) => (
              <li key={utente._id}>
                <button
                  type="button"
                  className="profilo"
                  onClick={() =>
                    onSelezionato({ id: utente._id, nome: utente.nome }, false)
                  }
                >
                  <span
                    className={`profilo__avatar avatar ${classeAvatar(utente._id)}`}
                    aria-hidden="true"
                  >
                    {iniziale(utente.nome)}
                  </span>
                  <span className="profilo__nome">{utente.nome}</span>
                  <span className="profilo__generi">
                    {utente.generiPreferiti.length > 0
                      ? utente.generiPreferiti.join(" · ")
                      : "Nessun genere scelto"}
                  </span>
                </button>
              </li>
            ))}

            <li>
              <button
                type="button"
                className="profilo profilo--nuovo"
                onClick={apriForm}
                aria-expanded={mostraForm}
              >
                <span className="profilo__piu">
                  <Icona nome="piu" dimensione={22} />
                </span>
                <span className="profilo__nome">Nuovo profilo</span>
              </button>
            </li>
          </ul>

          {mostraForm && (
            <form className="nuovo-profilo" onSubmit={creaUtente}>
              <h2 className="nuovo-profilo__titolo">Nuovo profilo</h2>

              <div className="nuovo-profilo__campi">
                <label className="campo">
                  <span className="campo__etichetta">Nome</span>
                  <input
                    ref={campoNome}
                    className="campo__input"
                    type="text"
                    placeholder="Come ti chiami?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    maxLength={60}
                    required
                    autoComplete="off"
                  />
                </label>
              </div>

              {erroreForm && <p className="errore">{erroreForm}</p>}

              <div className="nuovo-profilo__azioni">
                <button
                  type="submit"
                  className="pulsante pulsante--primario"
                  disabled={inInvio || nome.trim().length === 0}
                >
                  {inInvio ? "Creazione…" : "Crea e scegli i generi"}
                </button>

                {stato.utenti.length > 0 && (
                  <button
                    type="button"
                    className="pulsante pulsante--secondario"
                    onClick={() => {
                      setMostraForm(false);
                      setErroreForm(null);
                    }}
                  >
                    Annulla
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}

export default SelezionaUtente;
