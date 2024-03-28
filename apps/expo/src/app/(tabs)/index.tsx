import React from "react";
import { View } from "tamagui";

import { ItemListSection } from "~/components/item/ItemListSection";
import ScreenLayout from "~/components/layout/ScreenLayout";
import { useBookmarkStore, useWatchHistoryStore } from "~/stores/settings";

export default function HomeScreen() {
  const { bookmarks } = useBookmarkStore();
  const { watchHistory } = useWatchHistoryStore();

  return (
    <View style={{ flex: 1 }} flex={1}>
      <ScreenLayout>
        <ItemListSection title="Bookmarks" items={bookmarks} />
        <ItemListSection
          title="Continue Watching"
          items={watchHistory.map((x) => x.item)}
        />
      </ScreenLayout>
    </View>
  );
}
