import { useEffect, useState } from "react";
import type { Raccomandazione } from "../tipi";
import Card from "./Card";
import ConsiglioInEvidenza from "./ConsiglioInEvidenza";
import Icona from "./Icona";
import { leggiErrore } from "../api";
import SchedaFilm from "./SchedaFilm";

const DURATA_AVVISO_MS = 6000;

type Stato =
  | { fase: "caricamento" }
  | { fase: "errore"; messaggio: string }
  | { fase: "pronto"; dati: Raccomandazione[] };

type Props = {
  utenteId: string;
  nomeUtente: string;
  onUtenteNonValido: () => void;
};

function ListaConsigli({ utenteId, onUtenteNonValido }: Props) {
  const [stato, setStato] = useState<Stato>({ fase: "caricamento" });
  const [inInvio, setInInvio] = useState(false);
  const [inAggiornamento, setInAggiornamento] = useState(false);
  const [filmAperto, setFilmAperto] = useState<string | null>(null);
  const [erroreVoto, setErroreVoto] = useState<string | null>(null);

  const [versione, setVersione] = useState(0);

  const [ultimoVoto, setUltimoVoto] = useState<{
    id: string;
    titolo: string;
  } | null>(null);

  useEffect(() => {
    let attivo = true;

    async function carica() {
      try {
        const risposta = await fetch(`/api/raccomandazioni/${utenteId}`);
        if (!attivo) return;

        if (risposta.status === 404) {
          onUtenteNonValido();
          return;
        }

        if (!risposta.ok) {
          throw new Error(
            await leggiErrore(risposta, `Errore ${risposta.status}`),
          );
        }

        const dati = await risposta.json();
        if (attivo) setStato({ fase: "pronto", dati: dati.raccomandazioni });
      } catch (errore) {
        console.error(errore);
        if (attivo) {
          setStato({
            fase: "errore",
            messaggio:
              "Non riesco a caricare i consigli: il server potrebbe essere ancora in avvio.",
          });
        }
      } finally {
        if (attivo) setInAggiornamento(false);
      }
    }

    carica();
    return () => {
      attivo = false;
    };
  }, [utenteId, versione, onUtenteNonValido]);

  useEffect(() => {
    if (!ultimoVoto) return;
    const timer = setTimeout(() => setUltimoVoto(null), DURATA_AVVISO_MS);
    return () => clearTimeout(timer);
  }, [ultimoVoto]);

  function ricarica() {
    setInAggiornamento(true);
    setVersione((v) => v + 1);
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
          await leggiErrore(
            risposta,
            `Errore ${risposta.status} nel salvataggio del voto`,
          ),
        );
        return;
      }

      ricarica();

      const consigli = stato.fase === "pronto" ? stato.dati : [];
      const votato = consigli.find((c) => c.id === id);
      if (votato) setUltimoVoto({ id, titolo: votato.titolo });
    } catch (errore) {
      console.error("Errore nel segnare come visto:", errore);
      setErroreVoto("Non riesco a contattare il server. Riprova.");
    } finally {
      setInInvio(false);
    }
  }

  async function annullaVoto() {
    if (!ultimoVoto) return;

    try {
      setInInvio(true);
      setErroreVoto(null);

      const risposta = await fetch(
        `/api/utenti/${utenteId}/visioni/${ultimoVoto.id}`,
        {
          method: "DELETE",
        },
      );

      if (!risposta.ok) {
        setErroreVoto(
          await leggiErrore(
            risposta,
            `Errore ${risposta.status} nell'annullare il voto`,
          ),
        );
        return;
      }

      setUltimoVoto(null);
      ricarica();
    } catch (errore) {
      console.error("Errore nell'annullare il voto", errore);
      setErroreVoto("Non riesco a contattare il server. Riprova.");
    } finally {
      setInInvio(false);
    }
  }

  const [inEvidenza, ...altri] = stato.fase === "pronto" ? stato.dati : [];

  const votiBloccati = inInvio || inAggiornamento;

  return (
    <section className="consigli">
      <header className="intro intro--con-azione">
        <div>
          <p className="occhiello">Per te</p>
          <h1 className="intro__titolo intro__titolo--pagina">Scelti per te</h1>
          <p className="intro__testo">
            Ordinati per compatibilità con i tuoi gusti. Vota quelli che hai
            visto: i prossimi consigli saranno più precisi.
          </p>
        </div>
        <button
          type="button"
          className="pulsante pulsante--secondario"
          onClick={ricarica}
          disabled={votiBloccati}
        >
          <Icona nome="aggiorna" dimensione={16} />
          {inAggiornamento ? "Aggiorno…" : "Aggiorna"}
        </button>
      </header>

      {erroreVoto && <p className="errore">{erroreVoto}</p>}

      {stato.fase === "caricamento" && (
        <p className="stato">Caricamento dei consigli…</p>
      )}
      {stato.fase === "errore" && (
        <div className="stato stato--errore">
          <p>{stato.messaggio}</p>
          <button
            type="button"
            className="pulsante pulsante--secondario"
            onClick={ricarica}
            disabled={inAggiornamento}
          >
            {inAggiornamento ? "Riprovo…" : "Riprova"}
          </button>
        </div>
      )}

      {stato.fase === "pronto" && !inEvidenza && (
        <p className="stato">
          Hai votato tutto il catalogo: non ci sono altri titoli da
          consigliarti.
        </p>
      )}

      {inEvidenza && (
        <ConsiglioInEvidenza
          raccomandazione={inEvidenza}
          onSegnaVisto={segnaVisto}
          inInvio={votiBloccati}
          onApri={setFilmAperto}
        />
      )}

      {altri.length > 0 && (
        <section className="consigli__altri">
          <h2 className="titolo-sezione">Altri consigli per te</h2>
          <div className="consigli__griglia">
            {altri.map((r) => (
              <Card
                key={r.id}
                raccomandazione={r}
                onSegnaVisto={segnaVisto}
                inInvio={votiBloccati}
                onApri={setFilmAperto}
              />
            ))}
          </div>
        </section>
      )}

      {ultimoVoto && (
        <div className="notifica" role="status">
          <p>Hai votato «{ultimoVoto.titolo}»</p>
          <button
            type="button"
            className="notifica__annulla"
            onClick={annullaVoto}
            disabled={votiBloccati}
          >
            Annulla
          </button>
        </div>
      )}
      {filmAperto && (
        <SchedaFilm filmId={filmAperto} onChiudi={() => setFilmAperto(null)} />
      )}
    </section>
  );
}

export default ListaConsigli;
