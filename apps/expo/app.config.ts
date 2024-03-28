import type { ExpoConfig } from "expo/config";

import { version } from "./package.json";
import withRemoveiOSNotificationEntitlement from "./src/plugins/withRemoveiOSNotificationEntitlement";
import withRNBackgroundDownloader from "./src/plugins/withRNBackgroundDownloader";

const defineConfig = (): ExpoConfig => ({
  name: "movie-web",
  slug: "mw-mobile",
  scheme: "movieweb",
  version,
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "dev.movieweb.app",
    supportsTablet: true,
    requireFullScreen: true,
    infoPlist: {
      CFBundleName: "movie-web",
      EXDefaultScreenOrientationMask:
        "UIInterfaceOrientationMaskAllButUpsideDown",
      NSPhotoLibraryUsageDescription:
        "This app saves videos to the photo library.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },
  android: {
    package: "dev.movieweb.app",
    permissions: ["WRITE_SETTINGS"],
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    [withRemoveiOSNotificationEntitlement as unknown as string],
    [withRNBackgroundDownloader as unknown as string],
    [
      "expo-screen-orientation",
      {
        initialOrientation: "PORTRAIT_UP",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          minSdkVersion: 24,
          packagingOptions: {
            pickFirst: [
              "lib/x86/libcrypto.so",
              "lib/x86_64/libcrypto.so",
              "lib/armeabi-v7a/libcrypto.so",
              "lib/arm64-v8a/libcrypto.so",
            ],
          },
        },
      },
    ],
    [
      "expo-alternate-app-icons",
      [
        "./assets/images/main.png",
        "./assets/images/blue.png",
        "./assets/images/gray.png",
        "./assets/images/red.png",
        "./assets/images/teal.png",
      ],
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
        isAccessMediaLocationEnabled: true,
      },
    ],
  ],
});

export default defineConfig;
