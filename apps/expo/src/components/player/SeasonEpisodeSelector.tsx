import type { SheetProps } from "tamagui";
import { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useTheme, View } from "tamagui";

import { fetchMediaDetails, fetchSeasonDetails } from "@movie-web/tmdb";

import { usePlayerStore } from "~/stores/player/store";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";
import { Settings } from "./settings/Sheet";

const EpisodeSelector = ({
  seasonNumber,
  setSelectedSeason,
  ...props
}: SheetProps & {
  seasonNumber: number;
  setSelectedSeason: (season: number | null) => void;
}) => {
  const theme = useTheme();
  const meta = usePlayerStore((state) => state.meta);
  const setMeta = usePlayerStore((state) => state.setMeta);

  const { data, isLoading } = useQuery({
    queryKey: ["seasonEpisodes", meta!.tmdbId, seasonNumber],
    queryFn: async () => {
      return fetchSeasonDetails(meta!.tmdbId, seasonNumber);
    },
    enabled: meta !== null,
  });

  if (!meta) return null;

  return (
    <Settings.Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...props}
    >
      <Settings.SheetOverlay />
      <Settings.SheetHandle />
      <Settings.SheetFrame isLoading={isLoading}>
        <Settings.Header
          icon={
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.buttonSecondaryText.val}
              onPress={() => {
                setSelectedSeason(null);
                props.onOpenChange?.(false);
              }}
            />
          }
          title={`Season ${data?.season_number}`}
        />
        <Settings.Content>
          {data?.episodes.map((episode) => (
            <Settings.Item
              key={episode.id}
              iconLeft={
                <View
                  width={32}
                  height={32}
                  backgroundColor="#121c24"
                  justifyContent="center"
                  alignItems="center"
                  borderRadius={6}
                >
                  <Settings.Text fontSize={14}>
                    E{episode.episode_number}
                  </Settings.Text>
                </View>
              }
              title={episode.name}
              onPress={() => {
                setMeta({
                  ...meta,
                  episode: {
                    number: episode.episode_number,
                    tmdbId: episode.id.toString(),
                  },
                });
              }}
            />
          ))}
        </Settings.Content>
      </Settings.SheetFrame>
    </Settings.Sheet>
  );
};

export const SeasonSelector = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [episodeOpen, setEpisodeOpen] = useState(false);

  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const meta = usePlayerStore((state) => state.meta);

  const { data, isLoading } = useQuery({
    queryKey: ["seasons", meta!.tmdbId],
    queryFn: async () => {
      return fetchMediaDetails(meta!.tmdbId, "tv");
    },
    enabled: meta !== null,
  });

  if (meta?.type !== "show") return null;

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialCommunityIcons
              name="audio-video"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => setOpen(true)}
        >
          Episodes
        </MWButton>
      </Controls>

      <Settings.Sheet
        forceRemoveScrollEnabled={open}
        open={open}
        onOpenChange={setOpen}
      >
        <Settings.SheetOverlay />
        <Settings.SheetHandle />
        <Settings.SheetFrame isLoading={isLoading}>
          {episodeOpen && selectedSeason ? (
            <EpisodeSelector
              seasonNumber={selectedSeason}
              setSelectedSeason={setSelectedSeason}
              open={episodeOpen}
              onOpenChange={setEpisodeOpen}
            />
          ) : (
            <>
              <Settings.Header
                icon={
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={theme.playerSettingsUnactiveText.val}
                    onPress={() => setOpen(false)}
                  />
                }
                title={data?.result.name ?? ""}
              />
              <Settings.Content>
                {data?.result.seasons.map((season) => (
                  <Settings.Item
                    key={season.season_number}
                    title={`Season ${season.season_number}`}
                    iconRight={
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={24}
                        color="white"
                      />
                    }
                    onPress={() => {
                      setSelectedSeason(season.season_number);
                      setEpisodeOpen(true);
                    }}
                  />
                ))}
              </Settings.Content>
            </>
          )}
        </Settings.SheetFrame>
      </Settings.Sheet>
    </>
  );
};
