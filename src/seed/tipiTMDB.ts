export interface GenereTMDB {
  id: number;
  name: string;
}

export interface PersonaTMDB {
  name: string;
  job?: string;
  order?: number;
}

export interface ProviderTMDB {
  provider_name: string;
}

export interface DisponibilitaPaeseTMDB {
  flatrate?: ProviderTMDB[];
  rent?: ProviderTMDB[];
  buy?: ProviderTMDB[];
}

export interface DettaglioFilmTMDB {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime: number | null;
  poster_path: string | null;
  vote_average: number;
  genres: GenereTMDB[];
  credits: {
    cast: PersonaTMDB[];
    crew: PersonaTMDB[];
  };
  keywords?: {
    keywords: { name: string }[];
  };
  "watch/providers"?: {
    results: Record<string, DisponibilitaPaeseTMDB>;
  };
}

export interface PaginaPopolariTMDB {
  page: number;
  total_pages: number;
  results: { id: number }[];
}
