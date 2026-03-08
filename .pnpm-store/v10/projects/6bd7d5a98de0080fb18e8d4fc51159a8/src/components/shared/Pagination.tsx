import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PER_PAGE_OPTIONS, type PerPage } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  perPage: PerPage;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: PerPage) => void;
}

export function Pagination({ page, totalPages, totalResults, perPage, onPageChange, onPerPageChange }: PaginationProps) {
  if (totalResults === 0) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = Math.max(1, end - 4); i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between pt-2 border-t border-border">
      {/* Per-page selector */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Show</span>
        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v) as PerPage)}>
          <SelectTrigger className="w-16 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={String(opt)} className="text-xs">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>per page</span>
      </div>

      {/* Page buttons */}
      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          {getPageNumbers().map((p) => (
            <Button
              key={p}
              variant={p === page ? "secondary" : "ghost"}
              size="icon"
              className={cn("h-7 w-7 text-xs", p === page && "font-semibold")}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </nav>
      )}

      {/* Total count */}
      <p className="text-xs text-muted-foreground tabular-nums">
        {((page - 1) * perPage) + 1}–{Math.min(page * perPage, totalResults)} of {totalResults}
      </p>
    </div>
  );
}
