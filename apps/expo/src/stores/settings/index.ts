import type { StateStorage } from "zustand/middleware";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ScrapeMedia } from "@movie-web/provider-utils";

import type { ItemData } from "~/components/item/item";
import type { DownloadItem } from "~/hooks/DownloadManagerContext";
import type { ThemeStoreOption } from "~/stores/theme";

const storage = new MMKV();

const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};

interface ThemeStoreState {
  theme: ThemeStoreOption;
  setTheme: (theme: ThemeStoreOption) => void;
}

export const useThemeSettingsStore = create<
  ThemeStoreState,
  [["zustand/persist", ThemeStoreState]]
>(
  persist(
    (set) => ({
      theme: "main",
      setTheme: (theme: ThemeStoreOption) => set({ theme }),
    }),
    {
      name: "theme-settings",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

interface PlayerStoreState {
  gestureControls: boolean;
  setGestureControls: (enabled: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (enabled: boolean) => void;
}

export const usePlayerSettingsStore = create<
  PlayerStoreState,
  [["zustand/persist", PlayerStoreState]]
>(
  persist(
    (set) => ({
      gestureControls: Platform.select({
        ios: true,
        android: false,
        default: true,
      }),
      setGestureControls: (enabled: boolean) =>
        set({ gestureControls: enabled }),
      autoPlay: true,
      setAutoPlay: (enabled: boolean) => set({ autoPlay: enabled }),
    }),
    {
      name: "player-settings",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

interface DownloadHistoryStoreState {
  downloads: DownloadItem[];
  setDownloads: (downloads: DownloadItem[]) => void;
}

export const useDownloadHistoryStore = create<
  DownloadHistoryStoreState,
  [["zustand/persist", DownloadHistoryStoreState]]
>(
  persist(
    (set) => ({
      downloads: [],
      setDownloads: (downloads: DownloadItem[]) => set({ downloads }),
    }),
    {
      name: "download-history",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

interface BookmarkStoreState {
  bookmarks: ItemData[];
  setBookmarks: (bookmarks: ItemData[]) => void;
  addBookmark: (item: ItemData) => void;
  removeBookmark: (item: ItemData) => void;
  isBookmarked: (item: ItemData) => boolean;
}

export const useBookmarkStore = create<
  BookmarkStoreState,
  [["zustand/persist", BookmarkStoreState]]
>(
  persist(
    (set, get) => ({
      bookmarks: [],
      setBookmarks: (bookmarks: ItemData[]) => set({ bookmarks }),
      addBookmark: (item: ItemData) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, item],
        })),
      removeBookmark: (item: ItemData) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (bookmark) => bookmark.id !== item.id,
          ),
        })),
      isBookmarked: (item: ItemData) =>
        Boolean(get().bookmarks.find((bookmark) => bookmark.id === item.id)),
    }),
    {
      name: "bookmarks",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

interface WatchHistoryItem {
  item: ItemData;
  media: ScrapeMedia;
  positionMillis: number;
}

interface WatchHistoryStoreState {
  watchHistory: WatchHistoryItem[];
  hasWatchHistoryItem: (item: ItemData) => boolean;
  getWatchHistoryItem: (media: ScrapeMedia) => WatchHistoryItem | undefined;
  setWatchHistory: (watchHistory: WatchHistoryItem[]) => void;
  updateWatchHistory: (
    item: ItemData,
    media: ScrapeMedia,
    positionMillis: number,
  ) => void;
  removeFromWatchHistory: (item: ItemData) => void;
}

export const useWatchHistoryStore = create<
  WatchHistoryStoreState,
  [["zustand/persist", WatchHistoryStoreState]]
>(
  persist(
    (set, get) => ({
      watchHistory: [],
      hasWatchHistoryItem: (item: ItemData) =>
        Boolean(
          get().watchHistory.find(
            (historyItem) => historyItem.item.id === item.id,
          ),
        ),
      getWatchHistoryItem: (media: ScrapeMedia) =>
        get().watchHistory.find((historyItem) => {
          if (historyItem.media.type === "movie" && media.type === "movie") {
            return historyItem.media.tmdbId === media.tmdbId;
          } else if (
            historyItem.media.type === "show" &&
            media.type === "show"
          ) {
            return (
              historyItem.media.tmdbId === media.tmdbId &&
              historyItem.media.season === media.season &&
              historyItem.media.episode === media.episode
            );
          }
        }),
      setWatchHistory: (watchHistory: WatchHistoryItem[]) =>
        set({ watchHistory }),
      updateWatchHistory: (
        item: ItemData,
        media: ScrapeMedia,
        positionMillis: number,
      ) =>
        set((state) => ({
          watchHistory: [
            ...state.watchHistory.filter(
              (historyItem) => historyItem.item.id !== item.id,
            ),
            {
              item,
              media,
              positionMillis,
            },
          ],
        })),
      removeFromWatchHistory: (item: ItemData) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter(
            (historyItem) => historyItem.item.id !== item.id,
          ),
        })),
    }),
    {
      name: "watch-history",
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
