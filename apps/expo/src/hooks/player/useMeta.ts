import { useCallback } from "react";

import { transformSearchResultToScrapeMedia } from "@movie-web/provider-utils";
import { fetchMediaDetails, fetchSeasonDetails } from "@movie-web/tmdb";

import { usePlayerStore } from "~/stores/player/store";

export const useMeta = () => {
  const meta = usePlayerStore((state) => state.meta);
  const setMeta = usePlayerStore((state) => state.setMeta);

  const convertIdToMeta = useCallback(
    async (id: string, type: "movie" | "tv") => {
      const media = await fetchMediaDetails(id, type);
      if (!media) return;
      const scrapeMedia = transformSearchResultToScrapeMedia(
        media.type,
        media.result,
        meta?.season?.number,
        meta?.episode?.number,
      );
      let seasonData = null;
      if (scrapeMedia.type === "show") {
        seasonData = await fetchSeasonDetails(
          scrapeMedia.tmdbId,
          scrapeMedia.season.number,
        );
      }
      const m = {
        ...scrapeMedia,
        poster: media.result.poster_path,
        ...("season" in scrapeMedia
          ? {
              season: {
                number: scrapeMedia.season.number,
                tmdbId: scrapeMedia.tmdbId,
              },
              episode: {
                number: scrapeMedia.episode.number,
                tmdbId: scrapeMedia.episode.tmdbId,
              },
              episodes:
                seasonData?.episodes.map((e) => ({
                  tmdbId: e.id.toString(),
                  number: e.episode_number,
                  name: e.name,
                })) ?? [],
            }
          : {}),
      };
      setMeta(m);
      return m;
    },
    [meta?.episode?.number, meta?.season?.number, setMeta],
  );

  return { convertIdToMeta };
};
