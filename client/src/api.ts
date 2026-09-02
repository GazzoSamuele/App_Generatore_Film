/**
 * Estrae il messaggio d'errore dalle risposte dell'API, che hanno sempre
 * la forma { errore: "descrizione" }. Se il corpo non è leggibile usa il ripiego.
 */
export async function leggiErrore(risposta: Response, ripiego: string): Promise<string> {
  try {
    const dati: unknown = await risposta.json();
    if (
      typeof dati === "object" &&
      dati !== null &&
      typeof (dati as { errore?: unknown }).errore === "string"
    ) {
      return (dati as { errore: string }).errore;
    }
  } catch {
    // Corpo assente o non JSON: si usa il messaggio di ripiego.
  }

  return ripiego;
}
