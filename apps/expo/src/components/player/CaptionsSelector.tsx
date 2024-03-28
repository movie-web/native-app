import type { LanguageCode } from "iso-639-1";
import type { ContentCaption } from "subsrt-ts/dist/types/handler";
import { useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { parse } from "subsrt-ts";
import { Spinner, useTheme, View } from "tamagui";

import type { Stream } from "@movie-web/provider-utils";

import type { CaptionWithData } from "~/stores/captions";
import {
  getCountryCodeFromLanguage,
  getPrettyLanguageNameFromLocale,
} from "~/lib/language";
import { useCaptionsStore } from "~/stores/captions";
import { usePlayerStore } from "~/stores/player/store";
import { FlagIcon } from "../FlagIcon";
import { MWButton } from "../ui/Button";
import { Controls } from "./Controls";
import { Settings } from "./settings/Sheet";

const parseCaption = async (
  caption: Stream["captions"][0],
): Promise<CaptionWithData> => {
  const response = await fetch(caption.url);
  const data = await response.text();
  return {
    ...caption,
    data: parse(data).filter(
      (cue) => cue.type === "caption",
    ) as ContentCaption[],
  };
};

export const CaptionsSelector = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const captions = usePlayerStore(
    (state) => state.interface.currentStream?.captions,
  );
  const selectedCaption = useCaptionsStore((state) => state.selectedCaption);
  const setSelectedCaption = useCaptionsStore(
    (state) => state.setSelectedCaption,
  );

  const downloadCaption = useMutation({
    mutationKey: ["captions", selectedCaption?.id],
    mutationFn: parseCaption,
    onSuccess: (data) => {
      setSelectedCaption(data);
    },
  });

  if (!captions?.length) return null;

  return (
    <>
      <Controls>
        <MWButton
          type="secondary"
          icon={
            <MaterialCommunityIcons
              name="subtitles"
              size={24}
              color={theme.buttonSecondaryText.val}
            />
          }
          onPress={() => setOpen(true)}
        >
          Subtitles
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
          <Settings.Header
            icon={
              <MaterialIcons
                name="close"
                size={24}
                color={theme.playerSettingsUnactiveText.val}
                onPress={() => setOpen(false)}
              />
            }
            title="Subtitles"
            rightButton={
              <MWButton
                color="$playerSettingsUnactiveText"
                fontWeight="bold"
                chromeless
              >
                Customize
              </MWButton>
            }
          />
          <Settings.Content>
            <Settings.Item
              iconLeft={
                <View
                  width="$5"
                  height="$3"
                  backgroundColor="$subtitleSelectorBackground"
                  borderRadius="$5"
                />
              }
              title={"Off"}
              iconRight={
                <>
                  {!selectedCaption?.id && (
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={theme.sheetItemSelected.val}
                    />
                  )}
                </>
              }
              onPress={() => setSelectedCaption(null)}
            />

            {captions?.map((caption) => (
              <Settings.Item
                iconLeft={
                  <View
                    width="$5"
                    height="$3"
                    backgroundColor="$subtitleSelectorBackground"
                    borderRadius="$5"
                    overflow="hidden"
                  >
                    <FlagIcon
                      languageCode={getCountryCodeFromLanguage(
                        caption.language as LanguageCode,
                      )}
                    />
                  </View>
                }
                title={getPrettyLanguageNameFromLocale(caption.language) ?? ""}
                iconRight={
                  <>
                    {selectedCaption?.id === caption.id && (
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color={theme.sheetItemSelected.val}
                      />
                    )}
                    {downloadCaption.isPending &&
                      downloadCaption.variables.id === caption.id && (
                        <Spinner size="small" color="$loadingIndicator" />
                      )}
                  </>
                }
                onPress={() => downloadCaption.mutate(caption)}
                key={caption.id}
              />
            ))}
          </Settings.Content>
        </Settings.SheetFrame>
      </Settings.Sheet>
    </>
  );
};
