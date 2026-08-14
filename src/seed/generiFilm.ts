const CORREZIONI: Record<string, string> = {
  Romance: "Romantico",
};

const GENERI_DA_ESCLUDERE = new Set(["televisione film"]);

export function generiCorretti(nomi: string[]): string[] {
  const generi: string[] = [];
    for (const id of nomi) {
      if (GENERI_DA_ESCLUDERE.has(id)) continue;
      const nomeCorretto = CORREZIONI[id] ?? id;
      generi.push(nomeCorretto);
    }
    return generi;
}