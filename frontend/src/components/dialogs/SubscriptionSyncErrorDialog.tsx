import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";
import { types } from "../../../wailsjs/go/models";

interface SubscriptionSyncErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  version: string;
  message: string;
  errors: types.UserProfilesError[];
}

export function SubscriptionSyncErrorDialog({
  open,
  onOpenChange,
  itemName,
  version,
  message,
  errors,
}: SubscriptionSyncErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-amber-500">
            <TriangleAlert className="h-5 w-5 shrink-0" />
            Subscription Sync Failed
          </DialogTitle>
          <DialogDescription className="pt-0.5">
            Could not finish updating subscriptions for{" "}
            <span className="font-semibold text-foreground">{itemName}</span>{" "}
            {version}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground">{message}</p>

          {errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Details
              </p>
              <div className="divide-y rounded-lg border overflow-hidden text-sm">
                {errors.map((error, index) => (
                  <div
                    key={`${error.assetType}:${error.assetId}:${index}`}
                    className="space-y-0.5 px-3 py-2.5"
                  >
                    <p className="font-mono text-xs text-muted-foreground">
                      {error.assetType}:{error.assetId}
                    </p>
                    <p className="text-foreground">{error.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
