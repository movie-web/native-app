import type { ReactNode } from "react";
import React from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Text, useTheme, View } from "tamagui";

export interface ScrapeItemProps {
  status: "failure" | "pending" | "notfound" | "success" | "waiting";
  name: string;
  id?: string;
  percentage?: number;
  children?: ReactNode;
}

export interface ScrapeCardProps extends ScrapeItemProps {
  hasChildren?: boolean;
}

const statusTextMap: Partial<Record<ScrapeCardProps["status"], string>> = {
  notfound: "Doesn't have the video",
  failure: "Failed to scrape",
  pending: "Checking for videos...",
};

const mapPercentageToIcon = (percentage: number) => {
  const slice = Math.floor(percentage / 12.5);
  return `circle-slice-${slice === 0 ? 1 : slice}`;
};

export function StatusCircle({
  type,
  percentage,
}: {
  type: ScrapeItemProps["status"];
  percentage: number;
}) {
  const theme = useTheme();
  return (
    <>
      {type === "waiting" && (
        <MaterialCommunityIcons
          name="circle-outline"
          size={40}
          color={theme.scrapingNoResult.val}
        />
      )}
      {type === "pending" && (
        <MaterialCommunityIcons
          name={mapPercentageToIcon(percentage) as "circle-slice-1"}
          size={40}
          color={theme.scrapingLoading.val}
        />
      )}
      {type === "failure" && (
        <MaterialCommunityIcons
          name="close-circle"
          size={40}
          color={theme.scrapingError.val}
        />
      )}
      {type === "notfound" && (
        <MaterialIcons
          name="remove-circle"
          size={40}
          color={theme.scrapingNoResult.val}
        />
      )}
      {type === "success" && (
        <MaterialIcons
          name="check-circle"
          size={40}
          color={theme.scrapingSuccess.val}
        />
      )}
    </>
  );
}

export function ScrapeItem(props: ScrapeItemProps) {
  const text = statusTextMap[props.status];

  return (
    <View flex={1} flexDirection="column">
      <View flexDirection="row" alignItems="center" gap={16}>
        <StatusCircle type={props.status} percentage={props.percentage ?? 0} />
        <Text
          fontSize={18}
          color={props.status === "pending" ? "$scrapingLoading" : "white"}
        >
          {props.name}
        </Text>
      </View>
      <View flexDirection="row" alignItems="center" gap={16}>
        <View width={40} />
        <View>{text && <Text fontSize={18}>{text}</Text>}</View>
      </View>
      <View marginLeft={48}>{props.children}</View>
    </View>
  );
}

export function ScrapeCard(props: ScrapeCardProps) {
  return (
    <View width={384}>
      <View
        width="100%"
        borderRadius={10}
        paddingVertical={12}
        paddingHorizontal={24}
        backgroundColor={props.hasChildren ? "$scrapingCard" : "transparent"}
      >
        <ScrapeItem {...props} />
      </View>
    </View>
  );
}
