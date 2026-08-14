export interface Raccomandazione {
  id: string;
  titolo: string;
  tipo: "film" | "serie";
  anno: number;
  generi: string[];
  piattaforme: string[];
  posterUrl: string;
  votoMedio: number;
  compatibilita: number;
  motivi: string[];
  punteggio: number;
}