import * as Application from "expo-application";
import { Octokit } from "@octokit/rest";

function isVersionHigher(newVersion: string, currentVersion: string): boolean {
  const parseVersion = (version: string) =>
    version
      .replace(/^v/, "")
      .split(".")
      .map((part) => parseInt(part, 10));

  const newParts = parseVersion(newVersion);
  const currentParts = parseVersion(currentVersion);
  const maxLength = Math.max(newParts.length, currentParts.length);

  for (let i = 0; i < maxLength; i++) {
    const newPart = newParts[i] ?? 0;
    const currentPart = currentParts[i] ?? 0;

    if (newPart !== currentPart) {
      return newPart > currentPart;
    }
  }

  return false;
}

export async function checkForUpdate() {
  const octokit = new Octokit();

  const res = await octokit.repos
    .getLatestRelease({
      owner: "movie-web",
      repo: "native-app",
    })
    .catch(() => undefined);

  if (!res) return;

  const latestVersion = res.data.tag_name;
  const currentVersion = Application.nativeApplicationVersion ?? "0.0.0";

  if (isVersionHigher(latestVersion, currentVersion)) {
    return res;
  }
}
