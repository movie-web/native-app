import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { View } from "tamagui";

import type {
  HlsBasedStream,
  RunOutput,
  ScrapeMedia,
} from "@movie-web/provider-utils";
import {
  constructFullUrl,
  extractTracksFromHLS,
  findHighestQuality,
} from "@movie-web/provider-utils";

import type { ItemData } from "../item/item";
import type { AudioTrack } from "./AudioTrackSelector";
import type { PlayerMeta } from "~/stores/player/slices/video";
import { useDownloadManager } from "~/hooks/DownloadManagerContext";
import { useMeta } from "~/hooks/player/useMeta";
import { useScrape } from "~/hooks/player/useSourceScrape";
import { convertMetaToScrapeMedia } from "~/lib/meta";
import { PlayerStatus } from "~/stores/player/slices/interface";
import { usePlayerStore } from "~/stores/player/store";
import { ScrapeCard, ScrapeItem } from "./ScrapeCard";

interface ScraperProcessProps {
  data?: ItemData;
  media?: ScrapeMedia;
  download?: boolean;
}

export const ScraperProcess = ({
  data,
  media,
  download,
}: ScraperProcessProps) => {
  const router = useRouter();
  const { startDownload } = useDownloadManager();

  const scrollViewRef = useRef<ScrollView>(null);

  const { convertIdToMeta } = useMeta();
  const { startScraping, sourceOrder, sources, currentSource } = useScrape();

  const setStream = usePlayerStore((state) => state.setCurrentStream);
  const setHlsTracks = usePlayerStore((state) => state.setHlsTracks);
  const setAudioTracks = usePlayerStore((state) => state.setAudioTracks);
  const setPlayerStatus = usePlayerStore((state) => state.setPlayerStatus);
  const setSourceId = usePlayerStore((state) => state.setSourceId);

  useEffect(() => {
    const fetchData = async () => {
      if (!data && !media) return router.back();

      let streamResult: RunOutput | null = null;
      let meta: PlayerMeta | undefined = undefined;

      if (!media && data) {
        meta = await convertIdToMeta(data.id, data.type);
        if (!meta) return router.back();
      }

      const scrapeMedia = media ?? (meta && convertMetaToScrapeMedia(meta));
      if (!scrapeMedia) return router.back();
      streamResult = await startScraping(scrapeMedia);

      if (!streamResult) return router.back();
      if (download) {
        if (streamResult.stream.type === "file") {
          const highestQuality = findHighestQuality(streamResult.stream);
          const url = highestQuality
            ? streamResult.stream.qualities[highestQuality]?.url
            : null;
          if (!url) return;
          startDownload(url, "mp4", scrapeMedia).catch(console.error);
        } else if (streamResult.stream.type === "hls") {
          startDownload(streamResult.stream.playlist, "hls", scrapeMedia).catch(
            console.error,
          );
        }
        return router.back();
      }
      setStream(streamResult.stream);

      if (streamResult.stream.type === "hls") {
        const tracks = await extractTracksFromHLS(
          streamResult.stream.playlist,
          {
            ...streamResult.stream.preferredHeaders,
            ...streamResult.stream.headers,
          },
        );

        if (tracks) setHlsTracks(tracks);

        if (tracks?.audio.length) {
          const audioTracks: AudioTrack[] = tracks.audio.map((track) => ({
            uri: constructFullUrl(
              (streamResult?.stream as HlsBasedStream).playlist,
              track.uri,
            ),
            name: track.properties[0]?.attributes.name?.toString() ?? "Unknown",
            language:
              track.properties[0]?.attributes.language?.toString() ?? "Unknown",
            active: Boolean(track.properties[0]?.attributes.default) ?? false,
          }));

          const uniqueTracks = new Set(audioTracks.map((t) => t.language));

          const filteredAudioTracks = audioTracks.filter((track) => {
            if (uniqueTracks.has(track.language)) {
              uniqueTracks.delete(track.language);
              return true;
            }
            return false;
          });

          setAudioTracks(filteredAudioTracks);
        }
      }
      setPlayerStatus(PlayerStatus.READY);
      setSourceId(streamResult.sourceId);
    };
    void fetchData();
  }, [
    convertIdToMeta,
    data,
    download,
    media,
    router,
    setAudioTracks,
    setHlsTracks,
    setPlayerStatus,
    setSourceId,
    setStream,
    startDownload,
    startScraping,
  ]);

  let currentProviderIndex = sourceOrder.findIndex(
    (s) => s.id === currentSource || s.children.includes(currentSource ?? ""),
  );
  if (currentProviderIndex === -1) {
    currentProviderIndex = sourceOrder.length - 1;
  }

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      y: currentProviderIndex * 110,
      animated: true,
    });
  }, [currentProviderIndex]);

  return (
    <SafeAreaView
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <View
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$screenBackground"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 64,
          }}
        >
          {sourceOrder.map((order) => {
            const source = sources[order.id];
            if (!source) return null;
            const distance = Math.abs(
              sourceOrder.findIndex((o) => o.id === order.id) -
                currentProviderIndex,
            );
            return (
              <View
                key={order.id}
                style={{ opacity: Math.max(0, 1 - distance * 0.3) }}
              >
                <ScrapeCard
                  id={order.id}
                  name={source.name}
                  status={source.status}
                  hasChildren={order.children.length > 0}
                  percentage={source.percentage}
                >
                  <View
                    marginTop={order.children.length > 0 ? 8 : 0}
                    flexDirection="column"
                    gap={16}
                  >
                    {order.children.map((embedId) => {
                      const embed = sources[embedId];
                      if (!embed) return null;
                      return (
                        <ScrapeItem
                          id={embedId}
                          name={embed.name}
                          status={embed.status}
                          percentage={embed.percentage}
                          key={embedId}
                        />
                      );
                    })}
                  </View>
                </ScrapeCard>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
