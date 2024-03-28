import { Text, View } from "tamagui";

interface Props {
  title?: React.ReactNode | string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function ScreenLayout({ title, subtitle, children }: Props) {
  return (
    <View flex={1} padding={44} backgroundColor="$screenBackground">
      {typeof title === "string" && (
        <Text fontWeight="bold" fontSize={24}>
          {title}
        </Text>
      )}
      {typeof title !== "string" && title}
      <Text fontSize={16} fontWeight="bold" marginTop={1}>
        {subtitle}
      </Text>
      <View paddingVertical={12}>{children}</View>
    </View>
  );
}
