import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import {
  type CSSProperties,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { SidebarFilters } from '@/components/browse/SidebarFilters';
import type { AssetType } from '@/lib/asset-types';
import { cn } from '@/lib/utils';
import type { BrowseFilterState } from '@/stores/browse-store';

const SIDEBAR_WIDTH_REM = 15.5;
const SIDEBAR_GAP_REM = 1.5;

/** Minimum gap between the sidebar and the viewport/footer edge (px). */
const EDGE_GAP_PX = 24;

export const SIDEBAR_CONTENT_OFFSET = `${SIDEBAR_WIDTH_REM + SIDEBAR_GAP_REM}rem`;

export interface BrowseSidebarProps {
  open: boolean;
  onToggle: () => void;
  filters: BrowseFilterState;
  onFiltersChange: Dispatch<SetStateAction<BrowseFilterState>>;
  onTypeChange: (type: AssetType) => void;
  availableTags: string[];
  availableSpecialDemand: string[];
  modTagCounts: Record<string, number>;
  mapLocationCounts: Record<string, number>;
  mapSourceQualityCounts: Record<string, number>;
  mapLevelOfDetailCounts: Record<string, number>;
  mapSpecialDemandCounts: Record<string, number>;
  modCount: number;
  mapCount: number;
}

function getNavbarOffsetPx(): number {
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--app-navbar-offset',
      ),
    ) || 72
  );
}

/**
 * Floating filter sidebar for the Browse page.
 *
 * Vertical position:
 *   The sidebar is centred between the navbar bottom and the viewport bottom.
 *   When the footer scrolls into view and the sidebar is tall enough to reach
 *   it, the sidebar's `top` tracks just above the footer so it visually
 *   "scrolls up" with the page rather than overlapping it.
 *
 * Implementation note — `top` and `maxHeight` are mutated directly on the DOM
 * elements rather than via React state, so position updates on every scroll
 * frame incur zero React re-render overhead.  Only `left` (infrequent) goes
 * through React state.
 */
export function BrowseSidebar({
  open,
  onToggle,
  ...filterProps
}: BrowseSidebarProps) {
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [left, setLeft] = useState(0);

  // ── Custom scrollbar ─────────────────────────────────────────────────
  const [showScrollThumb, setShowScrollThumb] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  // ── Position management ──────────────────────────────────────────────
  useLayoutEffect(() => {
    const rootEl = document.getElementById('root');
    const mainEl = document.querySelector<HTMLElement>('main');
    const footerEl = document.querySelector<HTMLElement>('footer');

    // Left alignment: tracks <main>'s content left edge.
    const updateLeft = () => {
      if (!mainEl) return;
      const { left: l } = mainEl.getBoundingClientRect();
      setLeft(l + (parseFloat(getComputedStyle(mainEl).paddingLeft) || 0));
    };

    // Vertical position: centred between navbar and viewport bottom,
    // clamped upward when the footer enters the visible area.
    //
    // Mutates panel/toggle .style directly — no React re-render on scroll.
    const updatePosition = () => {
      const panel = panelRef.current;
      const toggle = toggleRef.current;
      if (!panel) return;

      const sH = panel.offsetHeight;
      const vh = window.innerHeight;
      const navOffset = getNavbarOffsetPx();

      // Ideal centred top — clamped so sidebar never overlaps the navbar.
      const idealTop = Math.max(
        navOffset + EDGE_GAP_PX,
        (navOffset + vh - sH) / 2,
      );

      // maxHeight: always derived from idealTop so it doesn't feed back into
      // the height → idealTop → maxHeight loop.
      const maxH = vh - idealTop - EDGE_GAP_PX;

      let top = idealTop;

      // Footer awareness: if the sidebar (at idealTop) would overlap the
      // footer, track the footer's position so the sidebar scrolls up with
      // the page rather than covering it.
      if (footerEl && sH > 0) {
        const footerTopVp = footerEl.getBoundingClientRect().top;
        const footerVisible = footerTopVp < vh;
        if (footerVisible && idealTop + sH >= footerTopVp - EDGE_GAP_PX) {
          top = Math.max(0, footerTopVp - sH - EDGE_GAP_PX);
        }
      }

      panel.style.top = `${top}px`;
      panel.style.maxHeight = `${maxH}px`;
      if (toggle) toggle.style.top = `${top}px`;
    };

    const handleResize = () => {
      updateLeft();
      updatePosition();
    };

    updateLeft();
    updatePosition();

    // ResizeObservers: <main> for left, panel itself for height changes
    // (filter sections collapsing/expanding).
    const mainRo = new ResizeObserver(updateLeft);
    if (mainEl) mainRo.observe(mainEl);

    const panelRo = new ResizeObserver(updatePosition);
    if (panelRef.current) panelRo.observe(panelRef.current);

    // #root is the page scroll container (html/body are overflow:hidden).
    window.addEventListener('resize', handleResize);
    rootEl?.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      mainRo.disconnect();
      panelRo.disconnect();
      window.removeEventListener('resize', handleResize);
      rootEl?.removeEventListener('scroll', updatePosition);
    };
  }, []); // runs once; all updates go through direct DOM mutation or closures

  // ── Scroll page to top when filters change ───────────────────────────
  const lastFiltersRef = useRef<BrowseFilterState | null>(null);
  useEffect(() => {
    if (!open) return;
    if (!lastFiltersRef.current) {
      lastFiltersRef.current = filterProps.filters;
      return;
    }
    document.getElementById('root')?.scrollTo({ top: 0, behavior: 'auto' });
    lastFiltersRef.current = filterProps.filters;
  }, [filterProps.filters, open]);

  // ── Custom scrollbar thumb ───────────────────────────────────────────
  useLayoutEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !open) {
      setShowScrollThumb(false);
      return;
    }

    const updateThumb = () => {
      const { clientHeight, scrollHeight, scrollTop } = scrollEl;
      const overflow = scrollHeight - clientHeight;
      if (overflow <= 1) {
        setShowScrollThumb(false);
        setThumbHeight(0);
        setThumbTop(0);
        return;
      }
      const nextH = Math.max(24, (clientHeight * clientHeight) / scrollHeight);
      const maxTop = clientHeight - nextH;
      setShowScrollThumb(true);
      setThumbHeight(nextH);
      setThumbTop((scrollTop / overflow) * maxTop);
    };

    updateThumb();
    scrollEl.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);

    const ro = new ResizeObserver(updateThumb);
    ro.observe(scrollEl);
    const contentEl = scrollEl.firstElementChild as HTMLElement | null;
    if (contentEl) ro.observe(contentEl);

    return () => {
      scrollEl.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
      ro.disconnect();
    };
  }, [filterProps.filters, open]);

  // `top` and `maxHeight` are NOT in the inline style — managed via direct
  // DOM mutation above.  Only `position`, `left`, and `width` come from React.
  const panelStyle = {
    position: 'fixed' as const,
    left,
    width: `${SIDEBAR_WIDTH_REM}rem`,
  };
  const toggleStyle = {
    position: 'fixed' as const,
    left,
    width: '2.5rem',
    height: '2.5rem',
  };

  return (
    <>
      {/* ── Expanded panel ─────────────────────────────────────────────── */}
      <aside
        ref={panelRef}
        aria-label="Browse filters"
        className={cn(
          'z-40 flex flex-col overflow-hidden',
          'rounded-2xl border border-border/70 bg-background/90 backdrop-blur-md shadow-sm',
          'transition-[opacity,transform] duration-200 ease-out',
          open
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-3 pointer-events-none',
        )}
        style={panelStyle}
      >
        {/* Header — proportions mirror the navbar pill */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-[clamp(0.65rem,1.4vw,1rem)] py-[clamp(0.42rem,0.88vw,0.6rem)]">
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-[clamp(0.78rem,0.92vw,0.88rem)] font-semibold text-muted-foreground">
            Filters
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse filters sidebar"
            className="mr-[-0.15rem] translate-x-0.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent/45 hover:text-primary"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {/* Scrollable filter content + overlay scrollbar thumb */}
        <div className="group/sidebar relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-visible px-[clamp(0.65rem,1.4vw,1rem)] py-3"
            onWheelCapture={(e) => e.stopPropagation()}
          >
            <SidebarFilters {...filterProps} />
          </div>

          {showScrollThumb && (
            <div className="pointer-events-none absolute bottom-3 right-1 top-3 w-1 opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              <div
                className="absolute left-0 w-full rounded-full bg-[color-mix(in_srgb,var(--foreground)_28%,transparent)]"
                style={
                  {
                    height: thumbHeight,
                    transform: `translateY(${thumbTop}px)`,
                  } as CSSProperties
                }
              />
            </div>
          )}
        </div>
      </aside>

      {/* ── Collapsed toggle pill ───────────────────────────────────────── */}
      <button
        ref={toggleRef}
        type="button"
        onClick={onToggle}
        aria-label="Expand filters sidebar"
        className={cn(
          'z-40 flex items-center justify-center',
          'rounded-xl border border-border/70 bg-background/90 backdrop-blur-md shadow-sm',
          'text-muted-foreground transition-all duration-200 ease-out',
          'hover:bg-accent/45 hover:text-primary',
          open
            ? 'opacity-0 pointer-events-none scale-90'
            : 'opacity-100 scale-100 pointer-events-auto',
        )}
        style={toggleStyle}
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>
    </>
  );
}
