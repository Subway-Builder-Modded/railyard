import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AssetActionDialog } from '@/components/dialogs/AssetActionDialog';
import type { AssetType } from '@/lib/asset-types';
import { useInstalledStore } from '@/stores/installed-store';

interface UninstallTarget {
  type: AssetType;
  id: string;
  name: string;
}

interface UninstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUninstallSuccess?: (targets: UninstallTarget[]) => void;
  type?: AssetType;
  id?: string;
  name?: string;
  targets?: UninstallTarget[];
}

export function UninstallDialog({
  open,
  onOpenChange,
  onUninstallSuccess,
  type,
  id,
  name,
  targets,
}: UninstallDialogProps) {
  const { uninstallAssets } = useInstalledStore();
  const [loading, setLoading] = useState(false);

  const uninstallTargets: UninstallTarget[] =
    targets ?? (type && id && name ? [{ type, id, name }] : []);
  const itemCount = uninstallTargets.length;
  const firstTarget = uninstallTargets[0];
  const titleName =
    itemCount === 1 ? (firstTarget?.name ?? 'item') : `${itemCount} items`;
  const singleType = itemCount === 1 ? firstTarget?.type : null;

  const handleUninstall = async () => {
    if (itemCount === 0) return;

    setLoading(true);
    try {
      await uninstallAssets(
        uninstallTargets.map((target) => ({
          id: target.id,
          type: target.type,
        })),
      );

      toast.success(
        itemCount === 1
          ? `${titleName} has been uninstalled.`
          : `${itemCount} assets have been uninstalled.`,
      );
      onUninstallSuccess?.(uninstallTargets);
      onOpenChange(false);
    } catch {
      toast.error(
        itemCount === 1
          ? `Failed to uninstall ${titleName}.`
          : `Failed to uninstall one or more selected assets.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssetActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Uninstall ${titleName}?`}
      description={
        itemCount === 1
          ? `This will remove all installed files for this ${singleType === 'mod' ? 'mod' : 'map'}. You can reinstall it later from the registry.`
          : 'This will remove all installed files for the selected assets. You can reinstall them later from the registry.'
      }
      icon={AlertTriangle}
      iconClassName="h-5 w-5 text-destructive"
      confirmLabel="Uninstall"
      confirmVariant="destructive"
      loading={loading}
      onConfirm={handleUninstall}
    />
  );
}
