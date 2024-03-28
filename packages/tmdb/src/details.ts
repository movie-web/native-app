import type {
  AppendToResponse,
  MovieDetails,
  SeasonDetails,
  TvShowDetails,
} from "tmdb-ts";

import { tmdb } from "./util";

export async function fetchMediaDetails<
  T extends "movie" | "tv",
  R = T extends "movie"
    ? {
        type: "movie";
        result: AppendToResponse<MovieDetails, "external_ids"[], "movie">;
      }
    : {
        type: "tv";
        result: AppendToResponse<TvShowDetails, "external_ids"[], "tvShow">;
      },
>(id: string, type: T): Promise<R | undefined> {
  if (type === "movie") {
    const movieResult = await tmdb.movies.details(parseInt(id, 10), [
      "external_ids",
    ]);
    return { type: "movie", result: movieResult } as R;
  }
  const tvResult = await tmdb.tvShows.details(parseInt(id, 10), [
    "external_ids",
  ]);
  return { type: "tv", result: tvResult } as R;
}

export async function fetchSeasonDetails(
  id: string,
  season: number,
): Promise<SeasonDetails | undefined> {
  try {
    const result = await tmdb.tvSeasons.details(
      { tvShowID: parseInt(id, 10), seasonNumber: season },
      ["external_ids"],
    );
    return result;
  } catch (ex) {
    return undefined;
  }
}
