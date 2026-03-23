import { SidebarFilters, type SidebarFiltersProps } from '@/components/shared/SidebarFilters';
import { SIDEBAR_CONTENT_OFFSET, SidebarPanel } from '@/components/shared/SidebarPanel';

export const LIBRARY_SIDEBAR_CONTENT_OFFSET = SIDEBAR_CONTENT_OFFSET;

export interface LibrarySidebarPanelProps extends SidebarFiltersProps {
  open: boolean;
  onToggle: () => void;
}

export function LibrarySidebarPanel({ open, onToggle, ...filterProps }: LibrarySidebarPanelProps) {
  return (
    <SidebarPanel open={open} onToggle={onToggle} ariaLabel="Library filters" filters={filterProps.filters}>
      <SidebarFilters {...filterProps} />
    </SidebarPanel>
  );
}
