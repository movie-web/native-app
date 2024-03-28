import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "tamagui";

import { findHighestQuality } from "@movie-web/provider-utils";

import { useDownloadManager } from "~/hooks/DownloadManagerContext";
import { convertMetaToScrapeMedia } from "~/lib/meta";
import { usePlayerStore } from "~/stores/player/store";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";

export const DownloadButton = () => {
  const theme = useTheme();
  const { startDownload } = useDownloadManager();
  const stream = usePlayerStore((state) => state.interface.currentStream);
  const meta = usePlayerStore((state) => state.meta);

  if (!meta) return null;

  const scrapeMedia = convertMetaToScrapeMedia(meta);
  let url: string | undefined | null = null;

  if (stream?.type === "file") {
    const highestQuality = findHighestQuality(stream);
    url = highestQuality ? stream.qualities[highestQuality]?.url : null;
  } else if (stream?.type === "hls") {
    url = stream.playlist;
  }

  if (!url) return null;

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialCommunityIcons
              name="download"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() =>
            url &&
            startDownload(
              url,
              stream?.type === "hls" ? "hls" : "mp4",
              scrapeMedia,
            ).catch(console.error)
          }
        >
          Download
        </MWButton>
      </Controls>
    </>
  );
};
