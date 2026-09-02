import { useEffect, useState, type FormEvent } from "react";
import type { UtenteRiassunto } from "../tipi";
import type { UtenteCorrente } from "../utenteCorrente";
import { leggiErrore } from "../api";

interface Props {
  onSelezionato: (utente: UtenteCorrente) => void;
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
  const [email, setEmail] = useState("");
  const [erroreForm, setErroreForm] = useState<string | null>(null);
  const [inInvio, setInInvio] = useState(false);

  async function caricaUtenti() {
    setStato({ fase: "caricamento" });
    try {
      const risposta = await fetch("/api/utenti");
      if (!risposta.ok) {
        throw new Error(await leggiErrore(risposta, `Errore ${risposta.status}`));
      }

      const utenti: UtenteRiassunto[] = await risposta.json();
      setStato({ fase: "pronto", utenti });
      setMostraForm(utenti.length === 0);
    } catch (errore) {
      console.error("Errore nel caricamento dei profili:", errore);
      setStato({
        fase: "errore",
        messaggio:
          "Non riesco a caricare i profili. Controlla che il server sia avviato e riprova.",
      });
    }
  }

  async function creaUtente(evento: FormEvent) {
    evento.preventDefault();
    setErroreForm(null);
    setInInvio(true);

    try {
      const risposta = await fetch("/api/utenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email }),
      });

      if (!risposta.ok) {
        setErroreForm(
          await leggiErrore(risposta, `Errore ${risposta.status} nella creazione del profilo`)
        );
        return;
      }

      const creato: UtenteRiassunto = await risposta.json();
      onSelezionato({ id: creato._id, nome: creato.nome });
    } catch (errore) {
      console.error("Errore nella creazione del profilo:", errore);
      setErroreForm("Non riesco a contattare il server. Riprova.");
    } finally {
      setInInvio(false);
    }
  }

  useEffect(() => {
    caricaUtenti();
  }, []);

  if (stato.fase === "caricamento") {
    return <p className="utenti__stato">Caricamento dei profili…</p>;
  }

  if (stato.fase === "errore") {
    return (
      <div className="utenti">
        <p className="utenti__errore">{stato.messaggio}</p>
        <button type="button" className="utenti__riprova" onClick={caricaUtenti}>
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="utenti">
      <h1 className="utenti__titolo">Chi sta guardando?</h1>
      <p className="utenti__sottotitolo">
        Scegli il tuo profilo: i consigli vengono calcolati sui gusti di chi lo usa.
      </p>

      {messaggioIniziale && <p className="utenti__avviso">{messaggioIniziale}</p>}

      {stato.utenti.length > 0 && (
        <ul className="utenti__elenco">
          {stato.utenti.map((utente) => (
            <li key={utente._id}>
              <button
                type="button"
                className="profilo"
                onClick={() => onSelezionato({ id: utente._id, nome: utente.nome })}
              >
                <span className="profilo__iniziale" aria-hidden="true">
                  {utente.nome.charAt(0).toUpperCase()}
                </span>
                <span className="profilo__nome">{utente.nome}</span>
                <span className="profilo__generi">
                  {utente.generiPreferiti.length > 0
                    ? utente.generiPreferiti.join(", ")
                    : "Nessun genere preferito"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {stato.utenti.length === 0 && !mostraForm && (
        <p className="utenti__vuoto">
          Non c'è ancora nessun profilo. Creane uno per iniziare.
        </p>
      )}

      {mostraForm ? (
        <form className="nuovo-profilo" onSubmit={creaUtente}>
          <h2 className="nuovo-profilo__titolo">Nuovo profilo</h2>

          <label className="nuovo-profilo__campo">
            Nome
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={60}
              required
              autoComplete="off"
            />
          </label>

          <label className="nuovo-profilo__campo">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </label>

          {erroreForm && <p className="nuovo-profilo__errore">{erroreForm}</p>}

          <div className="nuovo-profilo__azioni">
            <button
              type="submit"
              className="nuovo-profilo__conferma"
              disabled={inInvio || nome.trim().length === 0 || email.trim().length === 0}
            >
              {inInvio ? "Creazione…" : "Crea profilo"}
            </button>

            {stato.utenti.length > 0 && (
              <button
                type="button"
                className="nuovo-profilo__annulla"
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
      ) : (
        <button
          type="button"
          className="utenti__aggiungi"
          onClick={() => setMostraForm(true)}
        >
          + Crea un nuovo profilo
        </button>
      )}
    </div>
  );
}

export default SelezionaUtente;
