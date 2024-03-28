import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  FullScraperEvents,
  RunOutput,
  ScrapeMedia,
} from "@movie-web/provider-utils";
import {
  getMetaData,
  getVideoStreamFromEmbed,
  getVideoStreamFromSource,
  providers,
} from "@movie-web/provider-utils";

import { convertMetaToScrapeMedia } from "~/lib/meta";
import { usePlayerStore } from "~/stores/player/store";

export interface ScrapingItems {
  id: string;
  children: string[];
}

export interface ScrapingSegment {
  name: string;
  id: string;
  embedId?: string;
  status: "failure" | "pending" | "notfound" | "success" | "waiting";
  reason?: string;
  error?: any;
  percentage: number;
}

type ScraperEvent<Event extends keyof FullScraperEvents> = Parameters<
  NonNullable<FullScraperEvents[Event]>
>[0];

export const useBaseScrape = () => {
  const [sources, setSources] = useState<Record<string, ScrapingSegment>>({});
  const [sourceOrder, setSourceOrder] = useState<ScrapingItems[]>([]);
  const [currentSource, setCurrentSource] = useState<string>();
  const lastId = useRef<string | null>(null);

  const initEvent = useCallback((evt: ScraperEvent<"init">) => {
    setSources(
      evt.sourceIds
        .map((v) => {
          const source = getMetaData().find((s) => s.id === v);
          if (!source) throw new Error("invalid source id");
          const out: ScrapingSegment = {
            name: source.name,
            id: source.id,
            status: "waiting",
            percentage: 0,
          };
          return out;
        })
        .reduce<Record<string, ScrapingSegment>>((a, v) => {
          a[v.id] = v;
          return a;
        }, {}),
    );
    setSourceOrder(evt.sourceIds.map((v) => ({ id: v, children: [] })));
  }, []);

  const startEvent = useCallback((id: ScraperEvent<"start">) => {
    const lastIdTmp = lastId.current;
    setSources((s) => {
      if (s[id]) s[id]!.status = "pending";
      if (lastIdTmp && s[lastIdTmp] && s[lastIdTmp]!.status === "pending")
        s[lastIdTmp]!.status = "success";
      return { ...s };
    });
    setCurrentSource(id);
    lastId.current = id;
  }, []);

  const updateEvent = useCallback((evt: ScraperEvent<"update">) => {
    setSources((s) => {
      if (s[evt.id]) {
        s[evt.id]!.status = evt.status;
        s[evt.id]!.reason = evt.reason;
        s[evt.id]!.error = evt.error;
        s[evt.id]!.percentage = evt.percentage;
      }
      return { ...s };
    });
  }, []);

  const discoverEmbedsEvent = useCallback(
    (evt: ScraperEvent<"discoverEmbeds">) => {
      setSources((s) => {
        evt.embeds.forEach((v) => {
          const source = getMetaData().find(
            (src) => src.id === v.embedScraperId,
          );
          if (!source) throw new Error("invalid source id");
          const out: ScrapingSegment = {
            embedId: v.embedScraperId,
            name: source.name,
            id: v.id,
            status: "waiting",
            percentage: 0,
          };
          s[v.id] = out;
        });
        return { ...s };
      });
      setSourceOrder((s) => {
        const source = s.find((v) => v.id === evt.sourceId);
        if (!source) throw new Error("invalid source id");
        source.children = evt.embeds.map((v) => v.id);
        return [...s];
      });
    },
    [],
  );

  const startScrape = useCallback(() => {
    lastId.current = null;
  }, []);

  const getResult = useCallback((output: RunOutput | null) => {
    if (output && lastId.current) {
      setSources((s) => {
        if (!lastId.current) return s;
        if (s[lastId.current]) s[lastId.current]!.status = "success";
        return { ...s };
      });
    }
    return output;
  }, []);

  return {
    initEvent,
    startEvent,
    updateEvent,
    discoverEmbedsEvent,
    startScrape,
    getResult,
    sources,
    sourceOrder,
    currentSource,
  };
};

export function useScrape() {
  const {
    sources,
    sourceOrder,
    currentSource,
    updateEvent,
    discoverEmbedsEvent,
    initEvent,
    getResult,
    startEvent,
    startScrape,
  } = useBaseScrape();

  const startScraping = useCallback(
    async (media: ScrapeMedia) => {
      startScrape();
      const output = await providers.runAll({
        media,
        events: {
          init: initEvent,
          start: startEvent,
          update: updateEvent,
          discoverEmbeds: discoverEmbedsEvent,
        },
      });
      return getResult(output);
    },
    [
      initEvent,
      startEvent,
      updateEvent,
      discoverEmbedsEvent,
      getResult,
      startScrape,
    ],
  );

  return {
    startScraping,
    sourceOrder,
    sources,
    currentSource,
  };
}

export const useEmbedScrape = () => {
  const setCurrentStream = usePlayerStore((state) => state.setCurrentStream);

  const queryClient = useQueryClient();

  const mutate = useMutation({
    mutationKey: ["embedScrape"],
    mutationFn: async ({
      url,
      embedId,
    }: {
      url: string;
      embedId: string;
      sourceId: string;
    }) => {
      const result = await getVideoStreamFromEmbed({
        url,
        embedId,
      });
      if (!result) throw new Error("no result");
      if (result?.stream) {
        setCurrentStream(result.stream[0]!);
        return result.stream;
      }
      return result?.stream;
    },
    onSuccess: async () => {
      await queryClient.resetQueries({
        queryKey: ["sourceScrape"],
      });
    },
  });
  return mutate;
};

export const useSourceScrape = (sourceId: string | null) => {
  const meta = usePlayerStore((state) => state.meta);
  const setCurrentStream = usePlayerStore((state) => state.setCurrentStream);
  const setSourceId = usePlayerStore((state) => state.setSourceId);

  const query = useQuery({
    queryKey: ["sourceScrape", meta, sourceId],
    queryFn: async () => {
      if (!meta || !sourceId) return;
      const scrapeMedia = convertMetaToScrapeMedia(meta);
      const result = await getVideoStreamFromSource({
        sourceId,
        media: scrapeMedia,
      });

      if (result?.stream) {
        setCurrentStream(result.stream[0]!);
        setSourceId(sourceId);
        return [];
      }
      if (result?.embeds.length === 1) {
        const embedResult = await getVideoStreamFromEmbed(result.embeds[0]!);
        if (embedResult?.stream) {
          setCurrentStream(embedResult.stream[0]!);
          setSourceId(sourceId);
          return [];
        }
      }
      return result?.embeds;
    },
  });

  return query;
};
