import Icona from "./Icona";
import { classeAvatar, iniziale } from "../colori";
import type { UtenteCorrente } from "../utenteCorrente";

export type Schermata = "home" | "consigli" | "esplora" | "preferenze";

interface Props {
  // Senza utente (schermata di scelta del profilo) si vede solo il logo.
  utente: UtenteCorrente | null;
  schermata?: Schermata;
  onNaviga?: (schermata: Schermata) => void;
  onCambiaUtente?: () => void;
}

const VOCI: { schermata: Schermata; etichetta: string }[] = [
  { schermata: "home", etichetta: "Home" },
  { schermata: "consigli", etichetta: "Per te" },
  { schermata: "esplora", etichetta: "Esplora" },
  { schermata: "preferenze", etichetta: "I miei generi" },
];

function Intestazione({ utente, schermata, onNaviga, onCambiaUtente }: Props) {
  return (
    <header className="intestazione">
      <div className="intestazione__interno">
        <button
          type="button"
          className="logo"
          onClick={() => onNaviga?.("home")}
          disabled={!utente}
          aria-label="MovieMatch, vai alla home"
        >
          <span className="logo__icona">
            <Icona nome="play" dimensione={16} />
          </span>
          <span className="logo__testo">MovieMatch</span>
        </button>

        {utente && (
          <>
            <nav className="navigazione" aria-label="Sezioni">
              {VOCI.map((voce) => (
                <button
                  key={voce.schermata}
                  type="button"
                  className={
                    voce.schermata === schermata
                      ? "navigazione__voce navigazione__voce--attiva"
                      : "navigazione__voce"
                  }
                  aria-current={voce.schermata === schermata ? "page" : undefined}
                  onClick={() => onNaviga?.(voce.schermata)}
                >
                  {voce.etichetta}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className="profilo-attivo"
              onClick={onCambiaUtente}
              aria-label={`Profilo ${utente.nome}: cambia profilo`}
            >
              <span className={`profilo-attivo__avatar avatar ${classeAvatar(utente.id)}`}>
                {iniziale(utente.nome)}
              </span>
              <span className="profilo-attivo__nome">{utente.nome}</span>
              <span className="profilo-attivo__cambia">Cambia</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Intestazione;
