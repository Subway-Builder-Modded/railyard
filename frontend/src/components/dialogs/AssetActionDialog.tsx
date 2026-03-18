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

interface AssetActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  confirmLabel: string;
  confirmClassName?: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  loading: boolean;
  onConfirm: () => void;
  children?: ReactNode;
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
