import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PER_PAGE_OPTIONS, type PerPage } from "@/lib/constants";

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

  // Generate page numbers to show (max 5 centered around current)
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
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-muted-foreground">
        {totalResults} result{totalResults !== 1 ? "s" : ""}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers().map((p) => (
          <Button key={p} variant={p === page ? "default" : "outline"} size="icon" onClick={() => onPageChange(p)}>
            {p}
          </Button>
        ))}
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v) as PerPage)}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PER_PAGE_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
