import { Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AssetActionDialog } from '@/components/dialogs/AssetActionDialog';
import type { PendingUpdateTarget } from '@/lib/subscription-updates';
import { useInstalledStore } from '@/stores/installed-store';

interface UpdateSubscriptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targets: PendingUpdateTarget[];
  onUpdateSuccess?: (targets: PendingUpdateTarget[]) => void;
}

export function UpdateSubscriptionsDialog({
  open,
  onOpenChange,
  targets,
  onUpdateSuccess,
}: UpdateSubscriptionsDialogProps) {
  const { updateAssetsToLatest } = useInstalledStore();
  const [loading, setLoading] = useState(false);

  const sortedTargets = useMemo(
    () =>
      [...targets].sort((left, right) => left.name.localeCompare(right.name)),
    [targets],
  );

  const itemCount = sortedTargets.length;
  const firstTarget = sortedTargets[0];
  const titleName =
    itemCount === 1 ? (firstTarget?.name ?? 'item') : `${itemCount} items`;
  const title =
    itemCount === 1
      ? `Update ${titleName}?`
      : `Update ${itemCount} selected items?`;
  const description =
    itemCount === 1
      ? `This will update from ${firstTarget?.currentVersion} to ${firstTarget?.latestVersion}.`
      : 'This will update the selected assets to their latest available versions.';

  const handleUpdate = async () => {
    if (itemCount === 0) return;
    setLoading(true);
    try {
      await updateAssetsToLatest(
        sortedTargets.map((target) => ({
          id: target.id,
          type: target.type,
        })),
      );
      toast.success(
        itemCount === 1
          ? `${titleName} has been updated.`
          : `${itemCount} assets have been updated.`,
      );
      onUpdateSuccess?.(sortedTargets);
      onOpenChange(false);
    } catch (err) {
      toast.error(
        itemCount === 1
          ? `Failed to update ${titleName}.`
          : 'Failed to update one or more selected assets.',
      );
      console.warn('Failed to apply latest subscription updates', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssetActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={Info}
      iconClassName="h-5 w-5 text-[var(--update-primary)]"
      confirmLabel="Update"
      confirmClassName="bg-[var(--update-primary)] text-white hover:opacity-90"
      loading={loading}
      onConfirm={handleUpdate}
    >
      {itemCount > 1 && (
        <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <ul className="space-y-1">
            {sortedTargets.map((target) => (
              <li key={`${target.type}-${target.id}`} className="flex gap-2">
                <span className="min-w-0 flex-1 truncate">{target.name}</span>
                <span className="font-mono tabular-nums text-foreground">
                  {target.currentVersion} -&gt; {target.latestVersion}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AssetActionDialog>
  );
}
