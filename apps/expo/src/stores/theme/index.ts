import { setAlternateAppIcon } from "expo-alternate-app-icons";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { useThemeSettingsStore } from "~/stores/settings";

export type ThemeStoreOption = "main" | "blue" | "gray" | "red" | "teal";

export interface ThemeStore {
  theme: ThemeStoreOption;
  setTheme(v: ThemeStoreOption): void;
}

export const useThemeStore = create(
  immer<ThemeStore>((set) => {
    const { theme, setTheme: updateTheme } = useThemeSettingsStore.getState();

    return {
      theme,
      setTheme: (newTheme) => {
        updateTheme(newTheme);
        set((state) => {
          state.theme = newTheme;
          void setAlternateAppIcon(newTheme);
        });
      },
    };
  }),
);
