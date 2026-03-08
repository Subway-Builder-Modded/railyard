import { useState } from "react";
import { CircleX, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface InstallErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  version: string;
  error: string;
}

export function InstallErrorDialog({ open, onOpenChange, itemName, version, error }: InstallErrorDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleX className="h-5 w-5 text-destructive" />
            Installation Failed
          </DialogTitle>
          <DialogDescription>
            Failed to install <span className="font-semibold text-foreground">{itemName}</span> {version}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <pre className="rounded-md bg-muted p-4 text-xs font-mono whitespace-pre-wrap break-all max-h-60 overflow-y-auto">
            {error}
          </pre>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
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
