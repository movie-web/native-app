import type { Item } from "parse-hls";
import hls from "parse-hls";
import { default as toWebVTT } from "srt-webvtt";

import type {
  EmbedOutput,
  EmbedRunnerOptions,
  FileBasedStream,
  FullScraperEvents,
  Qualities,
  RunnerOptions,
  RunOutput,
  ScrapeMedia,
  SourcererOutput,
  SourceRunnerOptions,
  Stream,
} from "@movie-web/providers";
import {
  makeProviders,
  makeStandardFetcher,
  targets,
} from "@movie-web/providers";

export interface InitEvent {
  sourceIds: string[];
}

export interface UpdateEvent {
  id: string;
  percentage: number;
  status: UpdateEventStatus;
  error?: unknown;
  reason?: string;
}

export type UpdateEventStatus = "success" | "failure" | "notfound" | "pending";

export interface DiscoverEmbedsEvent {
  sourceId: string;
  embeds: {
    id: string;
    embedScraperId: string;
  }[];
}

export type RunnerEvent =
  | string
  | InitEvent
  | UpdateEvent
  | DiscoverEmbedsEvent;

export const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  target: targets.NATIVE,
  consistentIpForRequests: true,
});

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutHandle),
  );
}

export async function getVideoStream({
  media,
  forceVTT,
  events,
}: {
  media: ScrapeMedia;
  forceVTT?: boolean;
  events?: FullScraperEvents;
}): Promise<RunOutput | null> {
  try {
    const options: RunnerOptions = {
      media,
      events,
    };

    const stream = await withTimeout(providers.runAll(options), 10000);

    if (!stream) return null;

    if (forceVTT) {
      const streamResult = await convertStreamCaptionsToWebVTT(stream.stream);
      return { ...stream, stream: streamResult };
    }

    return stream;
  } catch (error) {
    return null;
  }
}

export async function getVideoStreamFromSource({
  sourceId,
  media,
  events,
}: {
  sourceId: string;
  media: ScrapeMedia;
  events?: SourceRunnerOptions["events"];
}): Promise<SourcererOutput | null> {
  try {
    const sourceResult = await withTimeout(
      providers.runSourceScraper({
        id: sourceId,
        media,
        events,
      }),
      10000,
    );

    return sourceResult;
  } catch (error) {
    return null;
  }
}

export async function getVideoStreamFromEmbed({
  embedId,
  url,
  events,
}: {
  embedId: string;
  url: string;
  events?: EmbedRunnerOptions["events"];
}): Promise<EmbedOutput | null> {
  try {
    const embedResult = await withTimeout(
      providers.runEmbedScraper({
        id: embedId,
        url,
        events,
      }),
      10000,
    );

    return embedResult;
  } catch (error) {
    return null;
  }
}

export function findHighestQuality(
  stream: FileBasedStream,
): Qualities | undefined {
  const qualityOrder: Qualities[] = [
    "4k",
    "1080",
    "720",
    "480",
    "360",
    "unknown",
  ];
  for (const quality of qualityOrder) {
    if (stream.qualities[quality]) {
      return quality;
    }
  }
  return undefined;
}

export interface HLSTracks {
  video: Item[];
  audio: Item[];
  subtitles: Item[];
}

export async function extractTracksFromHLS(
  playlistUrl: string,
  headers: Record<string, string>,
): Promise<HLSTracks | null> {
  try {
    const response = await fetch(playlistUrl, { headers }).then((res) =>
      res.text(),
    );
    const playlist = hls.parse(response);
    return {
      video: playlist.streamRenditions,
      audio: playlist.audioRenditions,
      subtitles: playlist.subtitlesRenditions,
    };
  } catch (e) {
    return null;
  }
}

export async function extractSegmentsFromHLS(
  playlistUrl: string,
  headers: Record<string, string>,
) {
  try {
    const response = await fetch(playlistUrl, { headers }).then((res) =>
      res.text(),
    );
    const playlist = hls.parse(response);

    const sortedStreams = playlist.streamRenditions
      .filter((stream) => stream.properties[0]?.attributes.resolution)
      .sort((a, b) => {
        const [widthA, heightA] = (
          a.properties[0]?.attributes.resolution as string | undefined
        )
          ?.split("x")
          .map(Number) ?? [0, 0];
        const [widthB, heightB] = (
          b.properties[0]?.attributes.resolution as string | undefined
        )
          ?.split("x")
          .map(Number) ?? [0, 0];
        if (!widthA || !heightA || !widthB || !heightB) return 0;
        return widthB * heightB - widthA * heightA;
      });

    const highestQuality = sortedStreams[0];
    if (!highestQuality) return null;

    const highestQualityUri = constructFullUrl(playlistUrl, highestQuality.uri);
    const highestQualityResponse = await fetch(highestQualityUri, {
      headers,
    }).then((res) => res.text());
    const highestQualityPlaylist = hls.parse(highestQualityResponse);

    return highestQualityPlaylist.segments.map((segment) =>
      constructFullUrl(highestQualityUri, segment.uri),
    );
  } catch (e) {
    return null;
  }
}

export async function convertStreamCaptionsToWebVTT(
  stream: Stream,
): Promise<Stream> {
  if (!stream.captions) return stream;
  for (const caption of stream.captions) {
    if (caption.type === "srt") {
      const response = await fetch(caption.url);
      const srt = await response.blob();
      caption.url = await toWebVTT(srt);
      caption.type = "vtt";
    }
  }
  return stream;
}

export const constructFullUrl = (playlistUrl: string, uri: string) => {
  const baseUrl = playlistUrl.substring(0, playlistUrl.lastIndexOf("/") + 1);
  return uri.startsWith("http://") || uri.startsWith("https://")
    ? uri
    : baseUrl + uri;
};
