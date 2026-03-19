import { AlertTriangle, FileArchive, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AssetActionDialog } from '@/components/dialogs/AssetActionDialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AssetConflictError,
  InvalidMapCodeError,
  useInstalledStore,
} from '@/stores/installed-store';

import { OpenImportAssetDialog } from '../../../wailsjs/go/main/App';
import type { types } from '../../../wailsjs/go/models';

interface ImportAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function ImportAssetDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: ImportAssetDialogProps) {
  const { importMapFromZip } = useInstalledStore();
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [conflict, setConflict] = useState<types.MapCodeConflict | null>(null);
  const [invalidCodeMessage, setInvalidCodeMessage] = useState<string | null>(
    null,
  );

  const runImport = async (zipPath: string, replaceOnConflict: boolean) => {
    setLoading(true);
    try {
      const result = await importMapFromZip(zipPath, replaceOnConflict);
      if (result.status === 'warn') {
        toast.warning(result.message || 'Map imported with warnings.');
      } else {
        toast.success(result.message || 'Map imported successfully.');
      }
      onImportSuccess?.();
      setConflict(null);
      setSelectedPath('');
      onOpenChange(false);
    } catch (err) {
      if (err instanceof AssetConflictError && err.conflicts.length > 0) {
        setConflict(err.conflicts[0]);
        return;
      }
      if (err instanceof InvalidMapCodeError) {
        setInvalidCodeMessage(err.message);
        return;
      }
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePickArchive = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const selection = await OpenImportAssetDialog('map');
      if (selection.status === 'error') {
        toast.error(selection.message || 'Failed to open import dialog');
        return;
      }
      if (selection.status === 'warn' || !selection.path?.trim()) {
        return;
      }

      setSelectedPath(selection.path);
      await runImport(selection.path, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileArchive className="h-5 w-5 text-[var(--update-primary)]" />
              Import Asset
            </DialogTitle>
            <DialogDescription>
              Import a local map ZIP into your Library. Local assets are tracked
              separately from registry assets.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Asset Type: <span className="font-medium text-foreground">Map</span>
            {selectedPath ? (
              <p className="mt-1 truncate">
                Selected Archive:{' '}
                <span className="text-foreground">{selectedPath}</span>
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              className="gap-1.5"
              onClick={handlePickArchive}
              disabled={loading}
            >
              <FolderOpen className="h-4 w-4" />
              {loading ? 'Working...' : 'Choose ZIP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {conflict && (
        <AssetActionDialog
          open={!!conflict}
          onOpenChange={(value) => {
            if (!value) {
              setConflict(null);
            }
          }}
          loading={loading}
          icon={AlertTriangle}
          iconClassName="h-5 w-5 text-[var(--warning-primary)]"
          title="Replace conflicting map?"
          description="This local import conflicts with an existing map. Replace the existing map to continue."
          conflict={conflict}
          confirmLabel="Replace"
          confirmClassName="bg-[var(--warning-primary)] text-black hover:opacity-90"
          onConfirm={() => {
            if (!selectedPath) return;
            void runImport(selectedPath, true);
          }}
        />
      )}

      {invalidCodeMessage && (
        <AssetActionDialog
          open={!!invalidCodeMessage}
          onOpenChange={(value) => {
            if (!value) {
              setInvalidCodeMessage(null);
            }
          }}
          loading={false}
          icon={AlertTriangle}
          iconClassName="h-5 w-5 text-[var(--warning-primary)]"
          title="Invalid local map code"
          description={`${invalidCodeMessage} Local map codes must be 2-4 uppercase letters (e.g. "AAA").`}
          confirmLabel="OK"
          confirmClassName="bg-[var(--warning-primary)] text-black hover:opacity-90"
          onConfirm={() => setInvalidCodeMessage(null)}
        />
      )}
    </>
  );
}
