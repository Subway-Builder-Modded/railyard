import {
  CheckCircle,
  CircleFadingArrowUp,
  FolderOpen,
  HardDrive,
  MapPin,
  Package,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'wouter';

import { UninstallDialog } from '@/components/dialogs/UninstallDialog';
import { UpdateSubscriptionsDialog } from '@/components/dialogs/UpdateSubscriptionsDialog';
import { GalleryImage } from '@/components/shared/GalleryImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { InstalledTaggedItem } from '@/hooks/use-filtered-installed-items';
import { assetTypeToListingPath } from '@/lib/asset-types';
import { getCountryFlagIcon } from '@/lib/flags';
import { getLocalAccentClasses } from '@/lib/local-accent';
import { formatSourceQuality } from '@/lib/map-filter-values';
import { MAX_CARD_BADGES } from '@/lib/search';
import type { SearchViewMode } from '@/lib/search-view-mode';
import {
  composeAssetKey,
  getPendingSubscriptionUpdate,
  type PendingUpdatesByKey,
} from '@/lib/subscription-updates';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/stores/config-store';
import { useLibraryStore } from '@/stores/library-store';

import { OpenInFileExplorer } from '../../../wailsjs/go/main/App';
import type { types } from '../../../wailsjs/go/models';

const UPDATE_ICON_ACCENT_CLASS = getLocalAccentClasses('update').iconButton;
const FILES_ICON_ACCENT_CLASS = getLocalAccentClasses('files').iconButton;
const UNINSTALL_ICON_ACCENT_CLASS = getLocalAccentClasses('uninstall').iconButton;

interface LibraryItemCardProps {
  entry: InstalledTaggedItem;
  pendingUpdatesByKey: PendingUpdatesByKey;
  onRefreshPendingUpdates: () => Promise<void>;
  viewMode: SearchViewMode;
}

function joinOsPath(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) return part.replace(/[\\/]+$/, '');
      return part.replace(/^[\\/]+|[\\/]+$/g, '');
    })
    .join('/');
}

function LocalBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400',
        className,
      )}
    >
      <HardDrive className="h-2.5 w-2.5 shrink-0" />
      Local
    </span>
  );
}

function TypePill({ isMap }: { isMap: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
      {isMap ? <MapPin className="h-2.5 w-2.5" /> : <Package className="h-2.5 w-2.5" />}
      {isMap ? 'Map' : 'Mod'}
    </span>
  );
}

export function LibraryItemCard({
  entry,
  pendingUpdatesByKey,
  onRefreshPendingUpdates,
  viewMode,
}: LibraryItemCardProps) {
  const [uninstallOpen, setUninstallOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const { selectedIds, toggleSelected, removeSelected } = useLibraryStore();
  const metroMakerDataPath = useConfigStore((s) => s.config?.metroMakerDataPath);

  const key = composeAssetKey(entry.type, entry.item.id);
  const isSelected = selectedIds.has(key);
  const isMap = entry.type === 'map';
  const isLocal = entry.isLocal;
  const map = isMap ? (entry.item as types.MapManifest) : null;

  const mapCityCode = map?.city_code?.trim().toUpperCase() ?? '';
  const mapCountry = map?.country?.trim().toUpperCase() ?? '';
  const CountryFlag = isMap ? getCountryFlagIcon(mapCountry) : null;

  const badges = isMap
    ? [
        map?.location,
        formatSourceQuality(map?.source_quality ?? ''),
        map?.level_of_detail,
        ...(map?.special_demand ?? []),
      ].filter((v): v is string => Boolean(v))
    : (entry.item.tags ?? []);

  const pendingUpdate = isLocal
    ? undefined
    : getPendingSubscriptionUpdate(pendingUpdatesByKey, entry.type, entry.item.id);

  const resolveInstallFolderPath = (): string | null => {
    if (!metroMakerDataPath) return null;
    if (entry.type === 'mod') {
      return joinOsPath(metroMakerDataPath, 'mods', entry.item.id);
    }
    const cityCode = (map?.city_code ?? '').trim();
    if (!cityCode) return joinOsPath(metroMakerDataPath, 'cities', 'data');
    return joinOsPath(metroMakerDataPath, 'cities', 'data', cityCode);
  };

  const handleOpenInstallFolder = () => {
    const folderPath = resolveInstallFolderPath();
    if (!folderPath) return;
    void (async () => {
      try {
        const result = await OpenInFileExplorer(folderPath);
        if (result?.status === 'error') {
          toast.error(result?.message || 'Failed to open install folder');
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : String(err));
      }
    })();
  };

  const projectHref = `/project/${assetTypeToListingPath(entry.type)}/${entry.item.id}`;

  const actionButtons = (
    <div className="flex items-center gap-0.5">
      {pendingUpdate && (
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-7 w-7 transition-colors', UPDATE_ICON_ACCENT_CLASS)}
          onClick={(e) => {
            e.preventDefault();
            setUpdateOpen(true);
          }}
          aria-label="Update to latest"
        >
          <CircleFadingArrowUp className="h-3.5 w-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 opacity-0 transition-[opacity,colors] group-hover/card:opacity-100',
          FILES_ICON_ACCENT_CLASS,
        )}
        onClick={(e) => {
          e.preventDefault();
          handleOpenInstallFolder();
        }}
        aria-label="Open install folder"
        disabled={!metroMakerDataPath}
      >
        <FolderOpen className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-7 w-7 opacity-0 transition-[opacity,colors] group-hover/card:opacity-100',
          UNINSTALL_ICON_ACCENT_CLASS,
        )}
        onClick={(e) => {
          e.preventDefault();
          setUninstallOpen(true);
        }}
        aria-label="Uninstall"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const dialogs = (
    <>
      {uninstallOpen && (
        <UninstallDialog
          open={uninstallOpen}
          onOpenChange={setUninstallOpen}
          onUninstallSuccess={() => {
            removeSelected([key]);
            void onRefreshPendingUpdates();
          }}
          type={entry.type}
          id={entry.item.id}
          name={entry.item.name}
        />
      )}
      {updateOpen && pendingUpdate && (
        <UpdateSubscriptionsDialog
          open={updateOpen}
          onOpenChange={setUpdateOpen}
          onUpdateSuccess={() => void onRefreshPendingUpdates()}
          targets={[
            {
              id: entry.item.id,
              type: entry.type,
              name: entry.item.name,
              currentVersion: pendingUpdate.currentVersion,
              latestVersion: pendingUpdate.latestVersion,
            },
          ]}
        />
      )}
    </>
  );

  if (viewMode === 'list') {
    return (
      <>
        <article
          className={cn(
            'group/card relative flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-all duration-150',
            'hover:border-foreground/15 hover:shadow-sm',
            isSelected && 'border-primary/40 bg-primary/5 ring-1 ring-primary/20',
          )}
        >
          {/* Checkbox */}
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleSelected(key)}
              aria-label={`Select ${entry.item.name}`}
              className={cn(
                'transition-opacity',
                !isSelected && 'opacity-0 group-hover/card:opacity-100',
              )}
            />
          </div>

          {/* Thumbnail */}
          <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
            <GalleryImage
              type={entry.type}
              id={entry.item.id}
              imagePath={entry.item.gallery?.[0]}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Name + author */}
          <div className="min-w-0 flex-1">
            {isLocal ? (
              <p className="truncate text-sm font-semibold text-foreground">{entry.item.name}</p>
            ) : (
              <Link
                href={projectHref}
                className="truncate text-sm font-semibold text-foreground hover:underline"
              >
                {entry.item.name}
              </Link>
            )}
            <p className="truncate text-xs text-muted-foreground">by {entry.item.author}</p>
          </div>

          {/* Map location */}
          {isMap && (mapCityCode || mapCountry) && (
            <div className="hidden shrink-0 text-right sm:block">
              {mapCityCode && (
                <span className="block font-mono text-xs font-bold text-foreground">
                  {mapCityCode}
                </span>
              )}
              {mapCountry && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  {CountryFlag && <CountryFlag className="h-3 w-4 rounded-[1px]" />}
                  {mapCountry}
                </span>
              )}
            </div>
          )}

          {/* Badges / Local */}
          <div className="hidden shrink-0 md:block">
            {isLocal ? (
              <LocalBadge />
            ) : badges.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">
                {badges.slice(0, MAX_CARD_BADGES).map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs px-1.5 py-0">
                    {badge}
                  </Badge>
                ))}
                {badges.length > MAX_CARD_BADGES && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    +{badges.length - MAX_CARD_BADGES}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>

          {/* Version */}
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {entry.installedVersion}
          </span>

          {/* Actions */}
          <div className="shrink-0">{actionButtons}</div>
        </article>

        {dialogs}
      </>
    );
  }

  // Full & compact card modes
  const isCompact = viewMode === 'compact';
  const imageClass = isCompact ? 'aspect-[16/10]' : 'aspect-video';

  const cardInner = (
    <article
      className={cn(
        'group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-150',
        'hover:border-foreground/15 hover:shadow-md',
        isSelected && 'border-primary/40 ring-1 ring-primary/25',
      )}
    >
      {/* Image area */}
      <div className={cn('relative overflow-hidden bg-muted', imageClass)}>
        {/* Selection checkbox */}
        <div
          className="absolute left-2 top-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSelected(key)}
            aria-label={`Select ${entry.item.name}`}
            className={cn(
              'border-white/60 bg-background/80 shadow transition-opacity backdrop-blur-sm',
              !isSelected && 'opacity-0 group-hover/card:opacity-100',
            )}
          />
        </div>

        {/* Type pill — top-right for compact, top-right below selection for full */}
        <div className="absolute right-2 top-2 z-10">
          {isLocal ? (
            <LocalBadge className="bg-amber-500/20 backdrop-blur-sm" />
          ) : (
            <Badge variant="success" className="gap-1 text-xs shadow-sm">
              <CheckCircle className="h-2.5 w-2.5" />
              {entry.installedVersion}
            </Badge>
          )}
        </div>

        {/* Asset type pill — bottom-left */}
        <div className="absolute bottom-2 left-2 z-10">
          <TypePill isMap={isMap} />
        </div>

        <GalleryImage
          type={entry.type}
          id={entry.item.id}
          imagePath={entry.item.gallery?.[0]}
          className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.02]"
        />
      </div>

      {/* Card body */}
      <div className={cn('flex flex-1 flex-col gap-2', isCompact ? 'p-3' : 'p-4')}>
        {/* Name + map location */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {isLocal ? (
              <h3 className={cn('font-semibold leading-snug text-foreground truncate', isCompact ? 'text-sm' : 'text-sm')}>
                {entry.item.name}
              </h3>
            ) : (
              <Link
                href={projectHref}
                className={cn('block truncate font-semibold leading-snug text-foreground hover:underline', isCompact ? 'text-sm' : 'text-sm')}
                onClick={(e) => e.stopPropagation()}
              >
                {entry.item.name}
              </Link>
            )}
            <p className={cn('truncate text-muted-foreground', isCompact ? 'mt-0.5 text-[11px]' : 'mt-0.5 text-xs')}>
              by {entry.item.author}
            </p>
          </div>
          {isMap && (mapCityCode || mapCountry) && (
            <div className="shrink-0 text-right">
              {mapCityCode && (
                <span className="block font-mono text-xs font-bold leading-none text-foreground">
                  {mapCityCode}
                </span>
              )}
              {mapCountry && (
                <span className="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  {CountryFlag && <CountryFlag className="h-3 w-4 rounded-[1px]" />}
                  {mapCountry}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        <p className={cn('flex-1 leading-relaxed text-muted-foreground', isCompact ? 'line-clamp-2 text-[11px]' : 'line-clamp-2 text-xs')}>
          {entry.item.description}
        </p>

        {/* Footer: badges or local indicator + actions */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            {isLocal ? (
              <LocalBadge />
            ) : badges.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {badges.slice(0, 2).map((badge) => (
                  <Badge key={badge} variant="secondary" className={isCompact ? 'h-5 px-1.5 text-[11px] py-0' : 'text-xs px-1.5 py-0'}>
                    {badge}
                  </Badge>
                ))}
                {badges.length > 2 && (
                  <Badge variant="outline" className={isCompact ? 'h-5 px-1.5 text-[11px] py-0' : 'text-xs px-1.5 py-0'}>
                    +{badges.length - 2}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          <div className="shrink-0">{actionButtons}</div>
        </div>
      </div>
    </article>
  );

  return (
    <>
      {cardInner}
      {dialogs}
    </>
  );
}
