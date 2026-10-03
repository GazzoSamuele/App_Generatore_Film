export interface UtenteCorrente {
  id: string;
  nome: string;
}

const CHIAVE = "moviematch:utente";
const CHIAVE_PROFILI = "moviematch:profili";

export function leggiProfili(): string[] {
  try {
    const grezzo = localStorage.getItem(CHIAVE_PROFILI);
    if (!grezzo) return [];

    const dati: unknown = JSON.parse(grezzo);
    if (!Array.isArray(dati) || dati.some((id) => typeof id !== "string")) {
      return [];
    }
    return dati;
  } catch {
    return [];
  }
}

export function aggiungiProfilo(id: string): void {
  const profili = leggiProfili();
  if (profili.includes(id)) return;

  try {
    localStorage.setItem(CHIAVE_PROFILI, JSON.stringify([...profili, id]));
  } catch {
    // stesso commento di salvaUtente: se localStorage è bloccato, pazienza
  }
}

export function rimuoviProfilo(id: string): void {
  const profili = leggiProfili();
  try {
    localStorage.setItem(
      CHIAVE_PROFILI,
      JSON.stringify(profili.filter((p) => p !== id)),
    );
  } catch {
    // stesso commento di salvaUtente: se localStorage è bloccato, pazienza
  }
}

export function leggiUtente(): UtenteCorrente | null {
  try {
    const grezzo = localStorage.getItem(CHIAVE);
    if (!grezzo) return null;

    const dati: unknown = JSON.parse(grezzo);
    if (
      typeof dati !== "object" ||
      dati === null ||
      typeof (dati as UtenteCorrente).id !== "string" ||
      typeof (dati as UtenteCorrente).nome !== "string"
    ) {
      return null;
    }

    return dati as UtenteCorrente;
  } catch {
    return null;
  }
}

export function salvaUtente(utente: UtenteCorrente): void {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(utente));
  } catch {
    // Se il browser blocca localStorage il profilo resta valido solo per questa sessione.
  }
}

export function dimenticaUtente(): void {
  try {
    localStorage.removeItem(CHIAVE);
  } catch {
    // Niente da fare: il profilo viene comunque scartato dallo stato dell'app.
  }
}
