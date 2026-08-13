export interface Raccomandazione {
  id: string;
  titolo: string;
  tipo: "film" | "serie";
  anno: number;
  generi: string[];
  piattaforma: string;
  posterUrl: string;
  votoMedio: number;
  compatibilita: number;
  motivi: string[];
  punteggio: number;
}