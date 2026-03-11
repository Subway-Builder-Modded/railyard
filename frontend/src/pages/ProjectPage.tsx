import { useState, useEffect, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useRegistryStore } from "@/stores/registry-store";
import { GetAssetDownloadCounts, GetVersions } from "../../wailsjs/go/registry/Registry";
import { GetGameVersion } from "../../wailsjs/go/main/App";
import { isCompatible } from "@/lib/semver";
import { types } from "../../wailsjs/go/models";
import { mergeVersionDownloads, withZeroDownloads } from "@/lib/version-downloads";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProjectHero } from "@/components/project/ProjectHero";
import { ProjectInfo } from "@/components/project/ProjectInfo";
import { VersionsTable } from "@/components/project/VersionsTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Separator } from "@/components/ui/separator";
import { CircleAlert } from "lucide-react";

export function ProjectPage() {
  const [, params] = useRoute("/project/:type/:id");
  const mods = useRegistryStore((s) => s.mods);
  const maps = useRegistryStore((s) => s.maps);

  const type = params?.type as "mods" | "maps" | undefined;
  const id = params?.id;

  const item =
    type === "mods"
      ? mods.find((m) => m.id === id)
      : type === "maps"
        ? maps.find((m) => m.id === id)
        : undefined;

  const [versions, setVersions] = useState<types.VersionInfo[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [gameVersion, setGameVersion] = useState<string>("");

  useEffect(() => {
    GetGameVersion().then((v) => setGameVersion(v || "")).catch(() => {});
  }, []);

  useEffect(() => {
    if (!item) return;
    const source = item.update.type === "github" ? item.update.repo : item.update.url;
    if (!source) {
      setVersionsLoading(false);
      setVersionsError("No update source configured");
      return;
    }
    let cancelled = false;
    setVersionsLoading(true);
    setVersionsError(null);
    GetVersions(item.update.type, source)
      .then(async (v) => {
        if (cancelled) return;
        const all = v || [];
        const visibleVersions = type === "mods" ? all.filter((ver) => ver.manifest) : all;

        let mergedVersions = withZeroDownloads(visibleVersions);
        const assetType = type === "mods" ? "mod" : "map";
        try {
          const countsResult = await GetAssetDownloadCounts(assetType, item.id);
          if (countsResult.status === "success") {
            mergedVersions = mergeVersionDownloads(
              visibleVersions,
              countsResult.counts ?? {},
              `${assetType}:${item.id}`,
            );
          } else {
            console.warn(`[${assetType}:${item.id}] Failed to fetch download counts: ${countsResult.message}`);
          }
        } catch (countErr) {
          const message = countErr instanceof Error ? countErr.message : String(countErr);
          console.warn(`[${assetType}:${item.id}] Failed to fetch download counts: ${message}`);
        }

        if (!cancelled) {
          setVersions(mergedVersions);
          setVersionsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setVersionsError(err instanceof Error ? err.message : String(err));
          setVersionsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [type, item?.id, item?.update.type, item?.update.repo, item?.update.url]);

  const latestVersion = versions[0];
  const latestCompatibleVersion = useMemo(() => {
    if (!gameVersion) return latestVersion;
    return versions.find((v) => isCompatible(gameVersion, v.game_version) !== false) ?? latestVersion;
  }, [versions, gameVersion, latestVersion]);
  const gallery = useMemo(() => item?.gallery || [], [item?.gallery]);

  if (!item || !type) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="Project not found"
        description="The mod or map you're looking for doesn't exist in the registry."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/search">Browse</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{item.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProjectHero type={type} id={item.id} gallery={gallery} />

      <ProjectInfo type={type} item={item} latestVersion={latestVersion} latestCompatibleVersion={latestCompatibleVersion} versionsLoading={versionsLoading} gameVersion={gameVersion} />

      <Separator />

      <VersionsTable type={type} itemId={item.id} itemName={item.name} update={item.update} versions={versions} loading={versionsLoading} error={versionsError} gameVersion={gameVersion} />
    </div>
  );
}
