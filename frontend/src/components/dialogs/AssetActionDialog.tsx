import { Loader2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { types } from '../../../wailsjs/go/models';

interface AssetActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  confirmLabel: string;
  confirmClassName?: string;
  confirmVariant?: 'default' | 'destructive';
  loading: boolean;
  onConfirm: () => void;
  conflict?: types.MapCodeConflict;
  children?: ReactNode;
}

function conflictSourceLabel(conflict: types.MapCodeConflict): string {
  if (conflict.existingAssetId?.startsWith('vanilla:')) {
    return 'Vanilla';
  }
  return conflict.existingIsLocal ? 'Local' : 'Registry';
}

export function AssetActionDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  iconClassName,
  confirmLabel,
  confirmClassName,
  confirmVariant = 'default',
  loading,
  onConfirm,
  conflict,
  children,
}: AssetActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={iconClassName ?? 'h-5 w-5'} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {conflict ? (
            <div className="mt-1 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">
                Conflicting City Code: {conflict.cityCode}
              </p>
              <p className="mt-1">
                Existing Asset: {conflict.existingAssetId} (
                {conflictSourceLabel(conflict)})
              </p>
              {conflict.existingVersion ? (
                <p className="mt-1">
                  Existing Version: {conflict.existingVersion}
                </p>
              ) : null}
            </div>
          ) : null}
          {children}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={loading}
            className={confirmClassName}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
