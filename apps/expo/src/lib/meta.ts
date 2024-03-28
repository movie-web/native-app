import type { ScrapeMedia } from "@movie-web/provider-utils";
import {
  fetchMediaDetails,
  fetchSeasonDetails,
  getMediaPoster,
} from "@movie-web/tmdb";

import type { ItemData } from "~/components/item/item";
import type { PlayerMeta } from "~/stores/player/slices/video";

export const convertMetaToScrapeMedia = (meta: PlayerMeta): ScrapeMedia => {
  if (meta.type === "movie") {
    return {
      title: meta.title,
      releaseYear: meta.releaseYear,
      type: "movie",
      tmdbId: meta.tmdbId,
      imdbId: meta.imdbId,
    };
  }
  if (meta.type === "show") {
    return {
      title: meta.title,
      releaseYear: meta.releaseYear,
      type: "show",
      tmdbId: meta.tmdbId,
      season: meta.season!,
      episode: meta.episode!,
      imdbId: meta.imdbId,
    };
  }
  throw new Error("Invalid meta type");
};

export const convertMetaToItemData = (meta: PlayerMeta): ItemData => {
  if (meta.type === "movie") {
    return {
      id: meta.tmdbId,
      title: meta.title,
      year: meta.releaseYear,
      type: meta.type,
      posterUrl: getMediaPoster(meta.poster ?? ""),
    };
  }
  if (meta.type === "show") {
    return {
      id: meta.tmdbId,
      title: meta.title,
      year: meta.releaseYear,
      type: "tv",
      posterUrl: getMediaPoster(meta.poster ?? ""),
    };
  }
  throw new Error("Invalid media type");
};

export const getNextEpisode = async (
  meta: PlayerMeta,
): Promise<PlayerMeta | undefined> => {
  if (meta.type === "show") {
    const currentEpisode = meta.episode!;
    const nextEpisode = meta.episodes!.find(
      (episode) => episode.number === currentEpisode.number + 1,
    );
    if (!nextEpisode) {
      const media = await fetchMediaDetails(meta.tmdbId, "tv");
      if (!media) return;

      const nextSeason = media.result.seasons.find(
        (season) => season.season_number === meta.season!.number + 1,
      );
      if (!nextSeason) return;
      const seasonDetails = await fetchSeasonDetails(
        meta.tmdbId,
        nextSeason.season_number,
      );
      if (!seasonDetails) return;
      return {
        ...meta,
        season: {
          number: nextSeason.season_number,
          tmdbId: meta.season!.tmdbId,
        },
        episode: {
          number: seasonDetails.episodes[0]?.episode_number ?? 1,
          tmdbId: seasonDetails.episodes[0]?.id.toString() ?? "",
          title: seasonDetails.episodes[0]?.name,
        },
      };
    }
    return {
      ...meta,
      episode: nextEpisode,
    };
  }
  throw new Error("Invalid meta type");
};
