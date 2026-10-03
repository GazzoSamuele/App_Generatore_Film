const CORREZIONI: Record<string, string[]> = {
  Romance: ["Romantico"],
  "Action & Adventure": ["Azione", "Avventura"],
  "Sci-Fi & Fantasy": ["Fantascienza", "Fantasy"],
  "War & Politics": ["Guerra"],
  Kids: ["Famiglia"],
};

const GENERI_DA_ESCLUDERE = new Set([
  "televisione film",
  "News",
  "Reality",
  "Soap",
  "Talk",
]);

export function generiCorretti(nomi: string[]): string[] {
  const generi: string[] = [];
  for (const nome of nomi) {
    if (GENERI_DA_ESCLUDERE.has(nome)) continue;
    const nomiCorretti = CORREZIONI[nome] ?? [nome];
    for (const nomeCorretto of nomiCorretti) {
      if (!generi.includes(nomeCorretto)) generi.push(nomeCorretto);
    }
  }
  return generi;
}
