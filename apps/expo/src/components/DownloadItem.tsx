import type { Asset } from "expo-media-library";
import type { NativeSyntheticEvent } from "react-native";
import type { ContextMenuOnPressNativeEvent } from "react-native-context-menu-view";
import React from "react";
import ContextMenu from "react-native-context-menu-view";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Progress, Spinner, Text, View } from "tamagui";

import { useDownloadManager } from "~/hooks/DownloadManagerContext";

export interface DownloadItemProps {
  id: string;
  filename: string;
  progress: number;
  speed: number;
  fileSize: number;
  downloaded: number;
  isFinished: boolean;
  statusText?: string;
  asset?: Asset;
  isHLS?: boolean;
  onPress: (asset?: Asset) => void;
}

enum ContextMenuActions {
  Cancel = "Cancel",
  Remove = "Remove",
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const DownloadItem: React.FC<DownloadItemProps> = ({
  id,
  filename,
  progress,
  speed,
  fileSize,
  downloaded,
  isFinished,
  statusText,
  asset,
  isHLS,
  onPress,
}) => {
  const percentage = progress * 100;
  const formattedFileSize = formatBytes(fileSize);
  const formattedDownloaded = formatBytes(downloaded);
  const { removeDownload, cancelDownload } = useDownloadManager();

  const contextMenuActions = [
    {
      title: ContextMenuActions.Remove,
    },
    ...(!isFinished ? [{ title: ContextMenuActions.Cancel }] : []),
  ];

  const onContextMenuPress = (
    e: NativeSyntheticEvent<ContextMenuOnPressNativeEvent>,
  ) => {
    if (e.nativeEvent.name === ContextMenuActions.Cancel) {
      void cancelDownload(id);
    } else if (e.nativeEvent.name === ContextMenuActions.Remove) {
      removeDownload(id);
    }
  };

  const renderStatus = () => {
    if (statusText) {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Spinner size="small" color="$loadingIndicator" />
          <Text fontSize={12} color="gray" style={{ marginLeft: 8 }}>
            {statusText}
          </Text>
        </View>
      );
    } else if (isFinished) {
      return (
        <Text fontSize={12} color="gray">
          Finished
        </Text>
      );
    } else {
      if (isHLS) return null;
      return (
        <Text fontSize={12} color="gray">
          {speed.toFixed(2)} MB/s
        </Text>
      );
    }
  };

  return (
    <ContextMenu
      actions={contextMenuActions}
      onPress={onContextMenuPress}
      previewBackgroundColor="transparent"
    >
      <TouchableOpacity onPress={() => onPress(asset)} activeOpacity={0.7}>
        <View
          marginBottom={16}
          borderRadius={8}
          borderColor="white"
          padding={16}
        >
          <Text marginBottom={4} fontSize={16}>
            {filename}
          </Text>
          <Progress
            value={percentage}
            height={10}
            backgroundColor="$progressBackground"
          >
            <Progress.Indicator
              animation="bounce"
              backgroundColor="$progressFilled"
            />
          </Progress>
          <View
            marginTop={8}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize={12} color="gray">
              {isHLS
                ? `${percentage.toFixed()}% - ${downloaded} of ${fileSize} segments`
                : `${percentage.toFixed()}% - ${formattedDownloaded} of ${formattedFileSize}`}
            </Text>
            {renderStatus()}
          </View>
        </View>
      </TouchableOpacity>
    </ContextMenu>
  );
};
