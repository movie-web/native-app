import { Image, Text, View } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";
import Icon from "../../../assets/images/icon-transparent.png";
import { BackButton } from "./BackButton";
import { Controls } from "./Controls";

const mapSeasonAndEpisodeNumberToText = (season: number, episode: number) => {
  return `S${season.toString().padStart(2, "0")}E${episode.toString().padStart(2, "0")}`;
};

export const Header = () => {
  const isIdle = usePlayerStore((state) => state.interface.isIdle);
  const meta = usePlayerStore((state) => state.meta);

  if (!isIdle) {
    return (
      <View
        zIndex={50}
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        height={64}
        paddingHorizontal="$8"
      >
        <View width={144}>
          <Controls>
            <BackButton />
          </Controls>
        </View>
        {meta && (
          <Text fontWeight="bold">
            {meta.title} ({meta.releaseYear}){" "}
            {meta.season !== undefined && meta.episode !== undefined
              ? mapSeasonAndEpisodeNumberToText(
                  meta.season.number,
                  meta.episode.number,
                )
              : ""}
          </Text>
        )}
        <View
          height="$3.5"
          width="$11"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap={2}
          paddingHorizontal="$4"
          paddingVertical="$1"
          opacity={0.8}
          backgroundColor="$pillBackground"
          borderRadius={24}
        >
          <Image source={Icon} height={24} width={24} />
          <Text fontWeight="bold">movie-web</Text>
        </View>
      </View>
    );
  }
};
