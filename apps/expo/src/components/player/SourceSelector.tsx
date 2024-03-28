import type { SheetProps } from "tamagui";
import { useCallback, useEffect, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Spinner, Text, useTheme, View } from "tamagui";

import { getBuiltinSources, providers } from "@movie-web/provider-utils";

import {
  useEmbedScrape,
  useSourceScrape,
} from "~/hooks/player/useSourceScrape";
import { usePlayerStore } from "~/stores/player/store";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";
import { Settings } from "./settings/Sheet";

const SourceItem = ({
  name,
  id,
  active,
  embed,
  onPress,
}: {
  name: string;
  id: string;
  active?: boolean;
  embed?: { url: string; embedId: string };
  onPress?: (id: string) => void;
}) => {
  const theme = useTheme();
  const { mutate, isPending, isError } = useEmbedScrape();

  return (
    <Settings.Item
      title={name}
      iconRight={
        <>
          {active && (
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={theme.sheetItemSelected.val}
            />
          )}
          {isError && (
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={theme.scrapingError.val}
            />
          )}

          {isPending && <Spinner size="small" color="$scrapingLoading" />}
        </>
      }
      onPress={() => {
        if (onPress) {
          onPress(id);
          return;
        }
        if (embed) {
          mutate({
            url: embed.url,
            embedId: embed.embedId,
            sourceId: id,
          });
        }
      }}
    />
  );
};

const EmbedsPart = ({
  sourceId,
  closeParent,
  ...props
}: SheetProps & {
  sourceId: string;
  closeParent?: (open: boolean) => void;
}) => {
  const theme = useTheme();
  const { data, isPending, isError, error, status } = useSourceScrape(sourceId);

  useEffect(() => {
    if (status === "success" && !isError && data && data?.length <= 1) {
      props.onOpenChange?.(false);
      closeParent?.(false);
    }
  }, [status, data, isError, props, closeParent]);

  return (
    <Settings.Sheet
      open={props.open}
      onOpenChange={props.onOpenChange}
      {...props}
    >
      <Settings.SheetOverlay />
      <Settings.SheetHandle />
      <Settings.SheetFrame>
        <Settings.Header
          icon={
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.buttonSecondaryText.val}
              onPress={() => {
                props.onOpenChange?.(false);
              }}
            />
          }
          title={providers.getMetadata(sourceId)?.name ?? "Embeds"}
        />
        <Settings.Content>
          <View alignItems="center" justifyContent="center">
            {isPending && <Spinner size="small" color="$loadingIndicator" />}
            {error && <Text>Something went wrong!</Text>}
          </View>
          {data && data?.length > 1 && (
            <Settings.Content>
              {data.map((embed) => {
                const metaData = providers.getMetadata(embed.embedId)!;
                return (
                  <SourceItem
                    key={embed.embedId}
                    name={metaData.name}
                    id={embed.embedId}
                    embed={embed}
                  />
                );
              })}
            </Settings.Content>
          )}
        </Settings.Content>
      </Settings.SheetFrame>
    </Settings.Sheet>
  );
};

export const SourceSelector = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);

  const sourceId = usePlayerStore((state) => state.interface.sourceId);
  const setSourceId = usePlayerStore((state) => state.setSourceId);

  const isActive = useCallback(
    (id: string) => {
      return sourceId === id;
    },
    [sourceId],
  );

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialCommunityIcons
              name="video"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => setOpen(true)}
        >
          Source
        </MWButton>
      </Controls>

      <Settings.Sheet
        forceRemoveScrollEnabled={open}
        open={open}
        onOpenChange={setOpen}
      >
        <Settings.SheetOverlay />
        <Settings.SheetHandle />
        <Settings.SheetFrame>
          {embedOpen && sourceId ? (
            <EmbedsPart
              sourceId={sourceId}
              open={embedOpen}
              onOpenChange={setEmbedOpen}
              closeParent={setOpen}
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
                title="Sources"
              />
              <Settings.Content>
                {getBuiltinSources()
                  .sort((a, b) => b.rank - a.rank)
                  .map((source) => (
                    <SourceItem
                      key={source.id}
                      name={source.name}
                      id={source.id}
                      active={isActive(source.id)}
                      onPress={(id) => {
                        setSourceId(id);
                        setEmbedOpen(true);
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
