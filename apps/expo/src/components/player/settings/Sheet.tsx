import type { SheetProps, ViewProps } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Separator,
  Sheet,
  Spinner,
  styled,
  Text,
  View,
} from "tamagui";

const PlayerText = styled(Text, {
  color: "$playerSettingsUnactiveText",
  fontWeight: "bold",
  fontSize: 18,
});

function SettingsSheet(props: SheetProps) {
  return (
    <Sheet
      snapPoints={[90]}
      dismissOnSnapToBottom
      modal
      native
      animation="spring"
      {...props}
    >
      {props.children}
    </Sheet>
  );
}

function SettingsSheetOverlay() {
  return (
    <Sheet.Overlay
      animation="lazy"
      backgroundColor="rgba(0, 0, 0, 0.7)"
      enterStyle={{ opacity: 0 }}
      exitStyle={{ opacity: 0 }}
    />
  );
}

function SettingsSheetHandle() {
  return <Sheet.Handle backgroundColor="$sheetHandle" />;
}

function SettingsSheetFrame({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }} backgroundColor="black">
      <Sheet.Frame
        backgroundColor="$playerSettingsBackground"
        padding="$5"
        left={insets.left}
        right={insets.right}
        gap="$4"
      >
        {isLoading && (
          <Spinner
            size="large"
            color="$loadingIndicator"
            style={{
              position: "absolute",
            }}
          />
        )}
        {!isLoading && children}
      </Sheet.Frame>
    </View>
  );
}

function SettingsHeader({
  icon,
  title,
  rightButton,
}: {
  icon: React.ReactNode;
  title: string;
  rightButton?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        style={{ paddingRight: insets.right }}
        flexDirection="row"
        alignItems="center"
        gap="$4"
      >
        {icon}
        <PlayerText flexGrow={1}>{title}</PlayerText>
        {rightButton}
      </View>
      <Separator />
    </>
  );
}

function SettingsContent({
  isScroll = true,
  children,
}: {
  isScroll?: boolean;
  children: React.ReactNode;
}) {
  const ViewDisplay = isScroll ? ScrollView : View;
  return (
    <ViewDisplay
      contentContainerStyle={{
        gap: "$4",
      }}
    >
      {children}
    </ViewDisplay>
  );
}

function SettingsItem({
  iconLeft,
  iconRight,
  title,
  ...props
}: ViewProps & {
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  title: string;
}) {
  return (
    <View flexDirection="row" gap="$4" alignItems="center" {...props}>
      {iconLeft}
      <PlayerText flexGrow={1} fontSize={16} fontWeight="700">
        {title}
      </PlayerText>
      {iconRight}
    </View>
  );
}

export const Settings = {
  Sheet: SettingsSheet,
  SheetOverlay: SettingsSheetOverlay,
  SheetHandle: SettingsSheetHandle,
  SheetFrame: SettingsSheetFrame,
  Header: SettingsHeader,
  Content: SettingsContent,
  Text: PlayerText,
  Item: SettingsItem,
};
