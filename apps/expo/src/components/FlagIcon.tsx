import { Image } from "tamagui";

// TODO: Improve flag icons. This is incomplete.
export function FlagIcon({ languageCode }: { languageCode: string }) {
  return (
    <Image
      source={{
        uri: `https://flagcdn.com/w80/${languageCode.toLowerCase()}.png`,
      }}
      width="100%"
      height="100%"
      resizeMode="contain"
    />
  );
}
