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

export interface UtenteRiassunto {
  _id: string;
  nome: string;
  generiPreferiti: string[];
}

export interface FilmCatalogo {
  id: string;
  titolo: string;
  tipo: "film" | "serie";
  anno: number;
  generi: string[];
  piattaforme: string[];
  posterUrl: string;
  votoMedio: number;
  descrizione: string;
}

export interface DettaglioFilm extends FilmCatalogo {
  durataMinuti: number;
  regista: string;
  cast: string[];
}
