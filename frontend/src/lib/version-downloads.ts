import { types } from "../../wailsjs/go/models";

export function withZeroDownloads(versions: types.VersionInfo[]): types.VersionInfo[] {
  return versions.map((version) => ({ ...version, downloads: 0 }));
}

export function mergeVersionDownloads(
  versions: types.VersionInfo[],
  counts: Record<string, number>,
  warningContext: string,
): types.VersionInfo[] {
  const countsByVersion = counts ?? {};
  const knownVersions = new Set(versions.map((version) => version.version));

  const merged = versions.map((version) => {
    if (!(version.version in countsByVersion)) {
      console.warn(`[${warningContext}] Missing download count for version "${version.version}"`);
    }
    return {
      ...version,
      downloads: countsByVersion[version.version] ?? 0,
    };
  });

  for (const version of Object.keys(countsByVersion)) {
    if (!knownVersions.has(version)) {
      console.warn(`[${warningContext}] Download counts contain unknown version "${version}"`);
    }
  }

  return merged;
}

