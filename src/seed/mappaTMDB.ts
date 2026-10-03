import type { IFilm } from "../models/Film.js";
import { generiCorretti } from "./generiFilm.js";
import type { DettaglioFilmTMDB, DettaglioSerieTMDB } from "./tipiTMDB.js";

const BASE_POSTER = "https://image.tmdb.org/t/p/w500";
const PAESE = "IT";
const MAX_ATTORI = 5;
const MAX_TAG = 8;

const PIATTAFORME_NORMALIZZATE: Record<string, string> = {
  "Amazon Prime Video": "Prime Video",
  "Disney Plus": "Disney+",
  "Paramount Plus": "Paramount+",
};

export function normalizzaPiattaforma(nome: string): string {
  const pulito = nome
    .replace(/ Amazon Channels?$/i, "")
    .replace(/ Apple TV channel$/i, "")
    .replace(/ with Ads$/i, "")
    .trim();

  return PIATTAFORME_NORMALIZZATE[pulito] ?? pulito;
}

export function annoDa(releaseDate: string): number {
  const anno = Number((releaseDate ?? "").slice(0, 4));
  return Number.isFinite(anno) && anno > 0 ? anno : 0;
}

export function mappaFilm(dettaglio: DettaglioFilmTMDB): IFilm {
  const disponibilita = dettaglio["watch/providers"]?.results?.[PAESE];

  return {
    titolo: dettaglio.title,
    tipo: "film",
    generi: generiCorretti(dettaglio.genres.map((g) => g.name)),
    tag: (dettaglio.keywords?.keywords ?? [])
      .slice(0, MAX_TAG)
      .map((k) => k.name),
    anno: annoDa(dettaglio.release_date),
    durataMinuti: dettaglio.runtime ?? 0,
    piattaforme: [
      ...new Set(
        (disponibilita?.flatrate ?? []).map((p) =>
          normalizzaPiattaforma(p.provider_name),
        ),
      ),
    ],
    regista:
      dettaglio.credits.crew.find((p) => p.job === "Director")?.name ?? "",
    cast: dettaglio.credits.cast.slice(0, MAX_ATTORI).map((p) => p.name),
    descrizione: dettaglio.overview,
    posterUrl: dettaglio.poster_path
      ? `${BASE_POSTER}${dettaglio.poster_path}`
      : "",
    votoMedio: Math.round(dettaglio.vote_average * 10) / 10,
  };
}

export function mappaSerie(dettaglio: DettaglioSerieTMDB): IFilm {
  const disponibilita = dettaglio["watch/providers"]?.results?.[PAESE];

  return {
    titolo: dettaglio.name,
    tipo: "serie",
    generi: generiCorretti(dettaglio.genres.map((g) => g.name)),
    tag: (dettaglio.keywords?.results ?? [])
      .slice(0, MAX_TAG)
      .map((k) => k.name),
    anno: annoDa(dettaglio.first_air_date),
    durataMinuti:
      dettaglio.episode_run_time?.[0] ??
      dettaglio.last_episode_to_air?.runtime ??
      0,
    piattaforme: [
      ...new Set(
        (disponibilita?.flatrate ?? []).map((p) =>
          normalizzaPiattaforma(p.provider_name),
        ),
      ),
    ],
    regista: dettaglio.created_by[0]?.name ?? "",
    cast: dettaglio.credits.cast.slice(0, MAX_ATTORI).map((p) => p.name),
    descrizione: dettaglio.overview,
    posterUrl: dettaglio.poster_path
      ? `${BASE_POSTER}${dettaglio.poster_path}`
      : "",
    votoMedio: Math.round(dettaglio.vote_average * 10) / 10,
  };
}
