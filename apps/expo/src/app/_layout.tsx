/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// @ts-expect-error - No exported types
import { ModalView } from "react-native-ios-modal";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { setupNativeSheet } from "@tamagui/sheet";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TamaguiProvider, Theme, useTheme } from "tamagui";
import tamaguiConfig from "tamagui.config";

import { DownloadManagerProvider } from "~/hooks/DownloadManagerContext";
import { useThemeStore } from "~/stores/theme";
// @ts-expect-error - Without named import it causes an infinite loop
import _styles from "../../tamagui-web.css";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

setupNativeSheet("ios", ModalView);

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger this, so it's safe to ignore */
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    OpenSansRegular: require("../../assets/fonts/OpenSans-Regular.ttf"),
    OpenSansLight: require("../../assets/fonts/OpenSans-Light.ttf"),
    OpenSansMedium: require("../../assets/fonts/OpenSans-Medium.ttf"),
    OpenSansBold: require("../../assets/fonts/OpenSans-Bold.ttf"),
    OpenSansSemiBold: require("../../assets/fonts/OpenSans-SemiBold.ttf"),
    OpenSansExtra: require("../../assets/fonts/OpenSans-ExtraBold.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        /* reloading the app might trigger this, so it's safe to ignore */
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

function ScreenStacks() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        autoHideHomeIndicator: true,
        gestureEnabled: true,
        animation: "default",
        animationTypeForReplace: "push",
        presentation: "card",
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.screenBackground.val,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          autoHideHomeIndicator: true,
          gestureEnabled: true,
          animation: "default",
          animationTypeForReplace: "push",
          presentation: "card",
        }}
      />
    </Stack>
  );
}

function RootLayoutNav() {
  const themeStore = useThemeStore((s) => s.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="main">
        <ToastProvider>
          <DownloadManagerProvider>
            <ThemeProvider value={DarkTheme}>
              <Theme name={themeStore}>
                <ScreenStacks />
              </Theme>
            </ThemeProvider>
          </DownloadManagerProvider>
          <ToastViewport />
        </ToastProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
