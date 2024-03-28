import { createAnimations } from "@tamagui/animations-moti";
import { config } from "@tamagui/config/v3";
import { createFont, createTamagui } from "tamagui";

import {
  blueTokens,
  grayTokens,
  mainTokens,
  redTokens,
  tealTokens,
} from "@movie-web/colors";

type Tokens =
  | typeof mainTokens
  | typeof blueTokens
  | typeof grayTokens
  | typeof redTokens
  | typeof tealTokens;

const createThemeConfig = (tokens: Tokens) => ({
  screenBackground: tokens.shade.c900,

  tabBarBackground: tokens.shade.c700,
  tabBarIcon: tokens.shade.c300,
  tabBarIconFocused: tokens.purple.c200,

  scrapingCard: tokens.shade.c700,
  scrapingLoading: tokens.purple.c200,
  scrapingNoResult: tokens.ash.c100,
  scrapingError: tokens.semantic.red.c200,
  scrapingSuccess: tokens.semantic.green.c200,

  playerSettingsBackground: tokens.ash.c900,
  playerSettingsUnactiveText: tokens.semantic.silver.c400,
  playerSettingsActiveText: tokens.shade.c100,

  subtitleSelectorBackground: tokens.ash.c500,

  pillBackground: tokens.shade.c300,
  pillHighlight: tokens.blue.c200,
  pillActiveBackground: tokens.shade.c300,

  sheetBackground: tokens.shade.c800,
  sheetItemBackground: tokens.shade.c600,
  sheetIcon: tokens.shade.c300,
  sheetText: tokens.shade.c100,
  sheetHandle: tokens.shade.c300,
  sheetItemSelected: tokens.purple.c200,

  videoSlider: tokens.ash.c50,
  videoSliderFilled: tokens.purple.c200,

  progressBackground: tokens.shade.c600,
  progressFilled: tokens.purple.c200,

  separatorBackground: tokens.ash.c600,

  loadingIndicator: tokens.purple.c200,

  buttonSecondaryBackground: tokens.ash.c700,
  buttonSecondaryText: tokens.semantic.silver.c300,
  buttonSecondaryBackgroundHover: tokens.ash.c700,
  buttonPrimaryBackground: tokens.white,
  buttonPrimaryText: tokens.black,
  buttonPrimaryBackgroundHover: tokens.semantic.silver.c100,
  buttonPurpleBackground: tokens.purple.c500,
  buttonPurpleBackgroundHover: tokens.purple.c400,
  buttonCancelBackground: tokens.ash.c500,
  buttonCancelBackgroundHover: tokens.ash.c300,

  switchActiveTrackColor: tokens.purple.c300,
  switchInactiveTrackColor: tokens.ash.c500,
  switchThumbColor: tokens.white,

  searchIcon: tokens.shade.c100,
  searchBackground: tokens.shade.c600,
  searchHoverBackground: tokens.shade.c600,
  searchFocused: tokens.shade.c400,
  searchPlaceholder: tokens.shade.c100,

  inputBackground: tokens.shade.c600,
  inputBorder: tokens.shade.c600,
  inputPlaceholderText: tokens.shade.c300,
  inputText: tokens.white,
  inputIconColor: tokens.shade.c50,
});

const openSansFace = {
  normal: { normal: "OpenSans-Regular", italic: "OpenSans-Italic" },
  bold: { normal: "OpenSans-Bold", italic: "OpenSans-BoldItalic" },
  300: { normal: "OpenSans-Light", italic: "OpenSans-LightItalic" },
  500: { normal: "OpenSans-Regular", italic: "OpenSans-Italic" },
  600: { normal: "OpenSans-SemiBold", italic: "OpenSans-SemiBoldItalic" },
  700: { normal: "OpenSans-Bold", italic: "OpenSans-BoldItalic" },
  800: { normal: "OpenSans-ExtraBold", italic: "OpenSans-ExtraBoldItalic" },
};

const headingFont = createFont({
  size: config.fonts.heading.size,
  lineHeight: config.fonts.heading.lineHeight,
  weight: config.fonts.heading.weight,
  letterSpacing: config.fonts.heading.letterSpacing,
  face: openSansFace,
});

const bodyFont = createFont({
  size: config.fonts.body.size,
  lineHeight: config.fonts.body.lineHeight,
  weight: config.fonts.body.weight,
  letterSpacing: config.fonts.body.letterSpacing,
  face: openSansFace,
});

export const tamaguiConfig = createTamagui({
  ...config,
  tokens: config.tokens,
  themes: {
    main: {
      ...config.themes.dark,
      ...createThemeConfig(mainTokens),
    },
    blue: {
      ...config.themes.dark,
      ...createThemeConfig(blueTokens),
    },
    gray: {
      ...config.themes.dark,
      ...createThemeConfig(grayTokens),
    },
    red: {
      ...config.themes.dark,
      ...createThemeConfig(redTokens),
    },
    teal: {
      ...config.themes.dark,
      ...createThemeConfig(tealTokens),
    },
  },
  animations: createAnimations({
    fast: {
      type: "spring",
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    bounce: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
    quicker: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
    static: {
      type: "decay",
      deceleration: 0.999,
    },
    lazy: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  }),
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
});

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends Conf {}
}
