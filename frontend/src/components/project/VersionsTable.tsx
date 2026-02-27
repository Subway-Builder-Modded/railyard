import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, ArrowDownToLine } from "lucide-react";
import { GetVersions } from "../../../wailsjs/go/main/Registry";
import { types } from "../../../wailsjs/go/models";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorBanner } from "@/components/shared/ErrorBanner";

interface VersionsTableProps {
  type: string
  update: types.UpdateConfig;
}

export function VersionsTable({ update }: VersionsTableProps) {
  const [versions, setVersions] = useState<types.VersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const source = update.type === "github" ? update.repo : update.url;
    if (!source) {
      setLoading(false);
      setError("No update source configured");
      return;
    }

    GetVersions(update.type, source)
      .then((v) => {
        setVersions(v || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, [update]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Versions</h2>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Versions</h2>
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Versions</h2>
        <EmptyState icon={FileText} title="No versions available" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Versions</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              {update.type === "custom" && <TableHead>Game Version</TableHead>}
              <TableHead>Changelog</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((v) => (
              <TableRow key={v.version}>
                <TableCell className="font-mono font-medium">
                  {v.version}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(v.date)}
                </TableCell>
                {update.type === "custom" && (
                  <TableCell className="text-muted-foreground font-mono text-xs">
                    {v.game_version}
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {v.changelog}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownToLine className="h-3 w-3" />
                    {v.downloads.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  {v.download_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={v.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
