import { useMemo } from "react";
import { useRegistryStore } from "@/stores/registry-store";
import { useFilteredItems } from "@/hooks/use-filtered-items";
import { SearchFilters } from "@/components/search/SearchFilters";
import { ItemCard } from "@/components/shared/ItemCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { CardSkeletonGrid } from "@/components/shared/CardSkeletonGrid";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Pagination } from "@/components/shared/Pagination";
import { SearchX } from "lucide-react";

export function SearchPage() {
  const { mods, maps, loading, error } = useRegistryStore();

  const allTags = useMemo(() => {
    const modTags = mods.flatMap((m) => m.tags ?? []);
    const mapTags = maps.flatMap((m) => m.tags ?? []);
    return [...new Set([...modTags, ...mapTags])].sort();
  }, [mods, maps]);

  const {
    items,
    page,
    totalPages,
    totalResults,
    query,
    type,
    selectedTags,
    sort,
    perPage,
    setQuery,
    setType,
    setSelectedTags,
    setSort,
    setPage,
    setPerPage,
  } = useFilteredItems({ mods, maps });

  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse</h1>
        <p className="text-muted-foreground">
          Discover mods and maps for Subway Builder
        </p>
      </div>

      <SearchFilters
        query={query}
        onQueryChange={setQuery}
        type={type}
        onTypeChange={setType}
        availableTags={allTags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        sort={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <CardSkeletonGrid count={perPage} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No results found"
          description={
            query
              ? `No items match "${query}"`
              : "No items match the current filters"
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(({ type: itemType, item }) => (
              <ItemCard
                key={`${itemType}-${item.id}`}
                type={itemType}
                item={item}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            totalResults={totalResults}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </>
      )}
    </div>
  );
}
