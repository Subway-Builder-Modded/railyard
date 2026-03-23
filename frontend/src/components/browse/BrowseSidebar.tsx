import { SidebarFilters, type SidebarFiltersProps } from '@/components/shared/SidebarFilters';
import { SIDEBAR_CONTENT_OFFSET, SidebarPanel } from '@/components/shared/SidebarPanel';

export { SIDEBAR_CONTENT_OFFSET };

export interface BrowseSidebarProps extends SidebarFiltersProps {
  open: boolean;
  onToggle: () => void;
}

export function BrowseSidebar({ open, onToggle, ...filterProps }: BrowseSidebarProps) {
  return (
    <SidebarPanel open={open} onToggle={onToggle} ariaLabel="Browse filters" filters={filterProps.filters}>
      <SidebarFilters {...filterProps} />
    </SidebarPanel>
  );
}
