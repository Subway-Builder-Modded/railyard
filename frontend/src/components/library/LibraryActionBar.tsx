import { CheckCircle, CircleFadingArrowUp, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { UninstallDialog } from '@/components/dialogs/UninstallDialog';
import { UpdateSubscriptionsDialog } from '@/components/dialogs/UpdateSubscriptionsDialog';
import { Button } from '@/components/ui/button';
import { type InstalledTaggedItem } from '@/hooks/use-filtered-installed-items';
import {
  type AssetTarget,
  composeAssetKey,
  type PendingUpdatesByKey,
  type PendingUpdateTarget,
  toPendingUpdateTargets,
} from '@/lib/subscription-updates';
import { useLibraryStore } from '@/stores/library-store';

interface LibraryActionBarProps {
  allItems: InstalledTaggedItem[];
  pendingUpdatesByKey: PendingUpdatesByKey;
  onRefreshPendingUpdates: () => Promise<void>;
}

export function LibraryActionBar({
  allItems,
  pendingUpdatesByKey,
  onRefreshPendingUpdates,
}: LibraryActionBarProps) {
  const { selectedIds, removeSelected } = useLibraryStore();
  const [uninstallTargets, setUninstallTargets] = useState<
    AssetTarget[] | null
  >(null);
  const [updateTargets, setUpdateTargets] = useState<
    PendingUpdateTarget[] | null
  >(null);

  if (selectedIds.size === 0) return null;

  const selectedTargets: AssetTarget[] = allItems
    .filter((item) => selectedIds.has(composeAssetKey(item.type, item.item.id)))
    .map((item) => ({
      type: item.type,
      id: item.item.id,
      name: item.item.name,
    }));

  const selectedUpdateTargets = toPendingUpdateTargets(
    selectedTargets,
    pendingUpdatesByKey,
  );

  const handleRemove = () => {
    setUninstallTargets(selectedTargets);
  };

  const handleUpdate = () => {
    setUpdateTargets(selectedUpdateTargets);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-lg animate-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-1.5 mr-2">
          <CheckCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selected
          </span>
        </div>

        {selectedUpdateTargets.length > 0 && (
          <Button
            size="sm"
            onClick={handleUpdate}
            className="gap-1.5 bg-[var(--update-primary)] text-white hover:opacity-90"
          >
            <CircleFadingArrowUp className="h-3.5 w-3.5" />
            Update Selected
          </Button>
        )}

        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          className="gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </Button>
      </div>

      {uninstallTargets && uninstallTargets.length > 0 && (
        <UninstallDialog
          open={uninstallTargets.length > 0}
          onOpenChange={(open) => {
            if (!open) {
              setUninstallTargets(null);
            }
          }}
          onUninstallSuccess={(targets) => {
            const removedKeys = targets.map((target) =>
              composeAssetKey(target.type, target.id),
            );
            removeSelected(removedKeys);
            void onRefreshPendingUpdates();
          }}
          targets={uninstallTargets}
        />
      )}

      {updateTargets && updateTargets.length > 0 && (
        <UpdateSubscriptionsDialog
          open={updateTargets.length > 0}
          onOpenChange={(open) => {
            if (!open) {
              setUpdateTargets(null);
            }
          }}
          onUpdateSuccess={() => {
            void onRefreshPendingUpdates();
          }}
          targets={updateTargets}
        />
      )}
    </>
  );
}
