import type { DownloadTask } from "@kesha-antonov/react-native-background-downloader";
import type { Asset } from "expo-media-library";
import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import {
  checkForExistingDownloads,
  completeHandler,
  download,
  setConfig,
} from "@kesha-antonov/react-native-background-downloader";
import VideoManager from "@salihgun/react-native-video-processor";
import { useToastController } from "@tamagui/toast";

import type { ScrapeMedia } from "@movie-web/provider-utils";
import { extractSegmentsFromHLS } from "@movie-web/provider-utils";

import { useDownloadHistoryStore } from "~/stores/settings";

export interface DownloadItem {
  id: string;
  filename: string;
  progress: number;
  speed: number;
  fileSize: number;
  downloaded: number;
  url: string;
  type: "mp4" | "hls";
  isFinished: boolean;
  statusText?: string;
  asset?: Asset;
  isHLS?: boolean;
  media: ScrapeMedia;
  downloadTask?: DownloadTask;
}

// @ts-expect-error - types are not up to date
setConfig({
  isLogsEnabled: false,
  progressInterval: 250,
});

interface DownloadManagerContextType {
  downloads: DownloadItem[];
  startDownload: (
    url: string,
    type: "mp4" | "hls",
    media: ScrapeMedia,
    headers?: Record<string, string>,
  ) => Promise<Asset | void>;
  removeDownload: (id: string) => void;
  cancelDownload: (id: string) => void;
}

const DownloadManagerContext = createContext<
  DownloadManagerContextType | undefined
>(undefined);

export const useDownloadManager = () => {
  const context = useContext(DownloadManagerContext);
  if (!context) {
    throw new Error(
      "useDownloadManager must be used within a DownloadManagerProvider",
    );
  }
  return context;
};

export const DownloadManagerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const toastController = useToastController();

  useEffect(() => {
    const initializeDownloads = () => {
      const { downloads } = useDownloadHistoryStore.getState();
      if (downloads) {
        setDownloads(downloads);
      }
    };

    void initializeDownloads();
  }, []);

  useEffect(() => {
    useDownloadHistoryStore.setState({ downloads });
  }, [downloads]);

  useEffect(() => {
    const checkRunningTasks = async () => {
      const existingTasks = await checkForExistingDownloads();
      existingTasks.forEach((task) => {
        task
          .progress(({ bytesDownloaded, bytesTotal }) => {
            const progress = bytesDownloaded / bytesTotal;
            updateDownloadItem(task.id, { progress });
          })
          .done(() => {
            completeHandler(task.id);
          })
          .error(({ error, errorCode }) => {
            console.error(`Download error: ${errorCode} - ${error}`);
          });
      });
    };

    void checkRunningTasks();
  }, []);

  const cancellationFlags = useState<Record<string, boolean>>({})[0];

  const setCancellationFlag = (downloadId: string, flag: boolean): void => {
    cancellationFlags[downloadId] = flag;
  };

  const getCancellationFlag = (downloadId: string): boolean => {
    return cancellationFlags[downloadId] ?? false;
  };

  const cancelDownload = (downloadId: string) => {
    setCancellationFlag(downloadId, true);
    const downloadItem = downloads.find((d) => d.id === downloadId);
    if (downloadItem?.downloadTask) {
      downloadItem.downloadTask.stop();
    }
    toastController.show("Download cancelled", {
      burntOptions: { preset: "done" },
      native: true,
      duration: 500,
    });
  };

  const startDownload = async (
    url: string,
    type: "mp4" | "hls",
    media: ScrapeMedia,
    headers?: Record<string, string>,
  ): Promise<Asset | void> => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== MediaLibrary.PermissionStatus.GRANTED) {
      toastController.show("Permission denied", {
        burntOptions: { preset: "error" },
        native: true,
        duration: 500,
      });
      return;
    }

    toastController.show("Download started", {
      burntOptions: { preset: "none" },
      native: true,
      duration: 500,
    });

    const newDownload: DownloadItem = {
      id: `download-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      filename: url.split("/").pop() ?? "unknown",
      progress: 0,
      speed: 0,
      fileSize: 0,
      downloaded: 0,
      type,
      url,
      isFinished: false,
      isHLS: type === "hls",
      media,
    };

    setDownloads((currentDownloads) => [newDownload, ...currentDownloads]);

    if (type === "mp4") {
      const asset = await downloadMP4(url, newDownload.id, headers ?? {});
      return asset;
    } else if (type === "hls") {
      const asset = await downloadHLS(url, newDownload.id, headers ?? {});
      return asset;
    }
  };

  const updateDownloadItem = (id: string, updates: Partial<DownloadItem>) => {
    setDownloads((currentDownloads) =>
      currentDownloads.map((download) =>
        download.id === id ? { ...download, ...updates } : download,
      ),
    );
  };

  interface DownloadProgress {
    bytesDownloaded: number;
    bytesTotal: number;
  }

  const downloadMP4 = (
    url: string,
    downloadId: string,
    headers: Record<string, string>,
  ): Promise<Asset> => {
    return new Promise<Asset>((resolve, reject) => {
      let lastBytesWritten = 0;
      let lastTimestamp = Date.now();

      const updateProgress = (downloadProgress: DownloadProgress) => {
        const currentTime = Date.now();
        const timeElapsed = (currentTime - lastTimestamp) / 1000;

        if (timeElapsed === 0) return;

        const newBytes = downloadProgress.bytesDownloaded - lastBytesWritten;
        const speed = newBytes / timeElapsed / 1024 / 1024;
        const progress =
          downloadProgress.bytesDownloaded / downloadProgress.bytesTotal;

        updateDownloadItem(downloadId, {
          progress,
          speed,
          fileSize: downloadProgress.bytesTotal,
          downloaded: downloadProgress.bytesDownloaded,
        });

        lastBytesWritten = downloadProgress.bytesDownloaded;
        lastTimestamp = currentTime;
      };

      const fileUri = FileSystem.cacheDirectory
        ? FileSystem.cacheDirectory + url.split("/").pop()
        : null;
      if (!fileUri) {
        console.error("Cache directory is unavailable");
        reject(new Error("Cache directory is unavailable"));
        return;
      }

      const downloadTask = download({
        id: downloadId,
        url,
        destination: fileUri,
        headers,
        isNotificationVisible: true,
      })
        .begin(() => {
          updateDownloadItem(downloadId, { downloadTask });
        })
        .progress(({ bytesDownloaded, bytesTotal }) => {
          updateProgress({ bytesDownloaded, bytesTotal });
        })
        .done(() => {
          saveFileToMediaLibraryAndDeleteOriginal(fileUri, downloadId)
            .then((asset) => {
              if (asset) {
                resolve(asset);
              } else {
                reject(new Error("No asset returned"));
              }
            })
            .catch((error) => reject(error));
        })
        .error(({ error, errorCode }) => {
          console.error(`Download error: ${errorCode} - ${error}`);
          reject(new Error(`Download error: ${errorCode} - ${error}`));
        });
    });
  };

  const downloadHLS = async (
    url: string,
    downloadId: string,
    headers: Record<string, string>,
  ) => {
    const segments = await extractSegmentsFromHLS(url, headers);

    if (!segments || segments.length === 0) {
      return removeDownload(downloadId);
    }

    const totalSegments = segments.length;
    let segmentsDownloaded = 0;

    const segmentDir = FileSystem.cacheDirectory + "segments/";
    await ensureDirExists(segmentDir);

    const updateProgress = () => {
      const progress = segmentsDownloaded / totalSegments;
      updateDownloadItem(downloadId, {
        progress,
        downloaded: segmentsDownloaded,
        fileSize: totalSegments,
      });
    };

    const localSegmentPaths = [];

    for (const [index, segment] of segments.entries()) {
      if (getCancellationFlag(downloadId)) {
        await cleanupDownload(segmentDir, downloadId);
        return;
      }

      const segmentFile = `${segmentDir}${index}.ts`;
      localSegmentPaths.push(segmentFile);

      try {
        await downloadSegment(downloadId, segment, segmentFile, headers);

        if (getCancellationFlag(downloadId)) {
          await cleanupDownload(segmentDir, downloadId);
          return;
        }

        segmentsDownloaded++;
        updateProgress();
      } catch (e) {
        console.error(e);
        if (getCancellationFlag(downloadId)) {
          await cleanupDownload(segmentDir, downloadId);
          return;
        }
      }
    }

    if (getCancellationFlag(downloadId)) {
      return removeDownload(downloadId);
    }

    updateDownloadItem(downloadId, { statusText: "Merging" });
    const uri = await VideoManager.mergeVideos(
      localSegmentPaths,
      `${FileSystem.cacheDirectory}output.mp4`,
    );
    const asset = await saveFileToMediaLibraryAndDeleteOriginal(
      uri,
      downloadId,
    );
    return asset;
  };

  const downloadSegment = async (
    downloadId: string,
    segmentUrl: string,
    segmentFile: string,
    headers: Record<string, string>,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const task = download({
        id: `${downloadId}-${segmentUrl.split("/").pop()}`,
        url: segmentUrl,
        destination: segmentFile,
        headers: headers,
      });

      task
        .done(() => {
          resolve();
        })
        .error((error) => {
          console.error(error);
          reject(error);
        });
    });
  };

  const cleanupDownload = async (segmentDir: string, downloadId: string) => {
    await FileSystem.deleteAsync(segmentDir, { idempotent: true });
    removeDownload(downloadId);
  };

  async function ensureDirExists(dir: string) {
    await FileSystem.deleteAsync(dir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  const saveFileToMediaLibraryAndDeleteOriginal = async (
    fileUri: string,
    downloadId: string,
  ): Promise<Asset | void> => {
    try {
      updateDownloadItem(downloadId, { statusText: "Importing" });

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await FileSystem.deleteAsync(fileUri);

      updateDownloadItem(downloadId, {
        statusText: undefined,
        asset,
        isFinished: true,
      });
      console.log("File saved to media library and original deleted");
      toastController.show("Download finished", {
        burntOptions: { preset: "done" },
        native: true,
        duration: 500,
      });
      return asset;
    } catch (error) {
      console.error("Error saving file to media library:", error);
      toastController.show("Download failed", {
        burntOptions: { preset: "error" },
        native: true,
        duration: 500,
      });
    }
  };

  const removeDownload = (id: string) => {
    const updatedDownloads = downloads.filter((download) => download.id !== id);
    setDownloads(updatedDownloads);
    useDownloadHistoryStore.setState({ downloads: updatedDownloads });
  };

  return (
    <DownloadManagerContext.Provider
      value={{ downloads, startDownload, removeDownload, cancelDownload }}
    >
      {children}
    </DownloadManagerContext.Provider>
  );
};
