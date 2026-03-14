import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibraryStore } from "@/stores/library-store";
import { UninstallDialog } from "@/components/dialogs/UninstallDialog";
import { Trash2, CheckCircle } from "lucide-react";
import { type InstalledTaggedItem } from "@/hooks/use-filtered-installed-items";
import type { AssetType } from "@/lib/asset-types";

interface LibraryActionBarProps {
  allItems: InstalledTaggedItem[];
}

export function LibraryActionBar({
  allItems,
}: LibraryActionBarProps) {
  const { selectedIds, clearSelection } = useLibraryStore();
  const [uninstallTarget, setUninstallTarget] = useState<{
    type: AssetType;
    id: string;
    name: string;
  } | null>(null);

  if (selectedIds.size === 0) return null;

  const selectedItems = allItems.filter((item) =>
    selectedIds.has(`${item.type}-${item.item.id}`),
  );

  const handleRemove = () => {
    if (selectedItems.length === 1) {
      const item = selectedItems[0];
      setUninstallTarget({
        type: item.type,
        id: item.item.id,
        name: item.item.name,
      });
    } else {
      setUninstallTarget({
        type: selectedItems[0].type,
        id: selectedItems[0].item.id,
        name: `${selectedItems.length} items`,
      });
    }
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

      {uninstallTarget && (
        <UninstallDialog
          open={!!uninstallTarget}
          onOpenChange={(open) => {
            if (!open) {
              setUninstallTarget(null);
              clearSelection();
            }
          }}
          type={uninstallTarget.type}
          id={uninstallTarget.id}
          name={uninstallTarget.name}
        />
      )}
    </>
  );
}
