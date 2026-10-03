// Devono restare allineati alle liste $colori-poster e $colori-avatar in
// styles/_variabili.scss (l'avatar 0 usa il colore d'accento).
const NUMERO_COLORI_POSTER = 8;
const NUMERO_COLORI_AVATAR = 5;

function indiceDa(testo: string, quanti: number): number {
  let hash = 0;
  for (const carattere of testo) {
    hash = (hash * 31 + (carattere.codePointAt(0) ?? 0)) >>> 0;
  }
  return hash % quanti;
}

/** Colore stabile per il poster segnaposto di un titolo. */
export function classePoster(titolo: string): string {
  return `poster--${indiceDa(titolo, NUMERO_COLORI_POSTER)}`;
}

/** Colore stabile per l'avatar di un profilo, uguale in ogni schermata. */
export function classeAvatar(utenteId: string): string {
  return `avatar--${indiceDa(utenteId, NUMERO_COLORI_AVATAR)}`;
}

export function iniziale(nome: string): string {
  return nome.trim().charAt(0).toUpperCase() || "?";
}
