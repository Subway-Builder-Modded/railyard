import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
