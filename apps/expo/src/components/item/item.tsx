import type { NativeSyntheticEvent } from "react-native";
import type { ContextMenuOnPressNativeEvent } from "react-native-context-menu-view";
import { Keyboard, TouchableOpacity } from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { useRouter } from "expo-router";
import { useToastController } from "@tamagui/toast";
import { Image, Text, View } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";
import { useBookmarkStore, useWatchHistoryStore } from "~/stores/settings";

export interface ItemData {
  id: string;
  title: string;
  type: "movie" | "tv";
  year: number;
  posterUrl: string;
}

export default function Item({ data }: { data: ItemData }) {
  const resetVideo = usePlayerStore((state) => state.resetVideo);
  const router = useRouter();
  const toastController = useToastController();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const { hasWatchHistoryItem, removeFromWatchHistory } =
    useWatchHistoryStore();

  const { title, type, year, posterUrl } = data;

  const handlePress = () => {
    resetVideo();
    Keyboard.dismiss();
    router.push({
      pathname: "/videoPlayer",
      params: { data: JSON.stringify(data) },
    });
  };

  enum ContextMenuActions {
    Bookmark = "Bookmark",
    RemoveBookmark = "Remove Bookmark",
    Download = "Download",
    RemoveWatchHistoryItem = "Remove from Continue Watching",
  }

  const contextMenuActions = [
    {
      title: isBookmarked(data)
        ? ContextMenuActions.RemoveBookmark
        : ContextMenuActions.Bookmark,
    },
    ...(type === "movie" ? [{ title: ContextMenuActions.Download }] : []),
    ...(hasWatchHistoryItem(data)
      ? [{ title: ContextMenuActions.RemoveWatchHistoryItem }]
      : []),
  ];

  const onContextMenuPress = (
    e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>,
  ) => {
    if (e.nativeEvent.name === ContextMenuActions.Bookmark) {
      addBookmark(data);
      toastController.show("Added to bookmarks", {
        burntOptions: { preset: "done" },
        native: true,
        duration: 500,
      });
    } else if (e.nativeEvent.name === ContextMenuActions.RemoveBookmark) {
      removeBookmark(data);
      toastController.show("Removed from bookmarks", {
        burntOptions: { preset: "done" },
        native: true,
        duration: 500,
      });
    } else if (e.nativeEvent.name === ContextMenuActions.Download) {
      router.push({
        pathname: "/videoPlayer",
        params: { data: JSON.stringify(data), download: "true" },
      });
    } else if (
      e.nativeEvent.name === ContextMenuActions.RemoveWatchHistoryItem
    ) {
      removeFromWatchHistory(data);
      toastController.show("Removed from Continue Watching", {
        burntOptions: { preset: "done" },
        native: true,
        duration: 500,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onLongPress={() => {}}
      style={{ width: "100%" }}
    >
      <View width="100%">
        <ContextMenu actions={contextMenuActions} onPress={onContextMenuPress}>
          <View
            marginBottom={4}
            aspectRatio={9 / 14}
            width="100%"
            overflow="hidden"
            borderRadius={24}
          >
            <Image source={{ uri: posterUrl }} width="100%" height="100%" />
          </View>
        </ContextMenu>
        <Text fontWeight="bold" fontSize={14}>
          {title}
        </Text>
        <View flexDirection="row" alignItems="center" gap={3}>
          <Text fontSize={12} color="gray">
            {type === "tv" ? "Show" : "Movie"}
          </Text>
          <View height={1} width={1} borderRadius={24} backgroundColor="gray" />
          <Text fontSize={12} color="gray">
            {year}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
