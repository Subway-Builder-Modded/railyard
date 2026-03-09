import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { types } from '../../wailsjs/go/models';
import { type PerPage, type SortOption } from '../lib/constants';
import { useProfileStore } from '@/stores/profile-store';

export type TaggedItem =
  | { type: "mods"; item: types.ModManifest }
  | { type: "maps"; item: types.MapManifest };

type TypeFilter = "all" | "mods" | "maps";

interface UseFilteredItemsParams {
  mods: types.ModManifest[];
  maps: types.MapManifest[];
}

function matchesQuery(item: TaggedItem, query: string): boolean {
  const q = query.toLowerCase();

  const base = item.item;
  if (base.name?.toLowerCase().includes(q)) return true;
  if (base.author?.toLowerCase().includes(q)) return true;
  if (base.description?.toLowerCase().includes(q)) return true;
  if (base.tags?.some((t) => t.toLowerCase().includes(q))) return true;

  if (item.type === "maps") {
    const map = item.item as types.MapManifest;
    if (map.city_code?.toLowerCase().includes(q)) return true;
    if (map.country?.toLowerCase().includes(q)) return true;
  }

  return false;
}

function matchesTags(item: TaggedItem, selectedTags: string[]): boolean {
  if (selectedTags.length === 0) return true;
  const tags = item.item.tags;
  if (!tags || tags.length === 0) return false;
  return selectedTags.some((t) => tags.includes(t));
}

function compareItems(a: TaggedItem, b: TaggedItem, sort: SortOption): number {
  switch (sort) {
    case "name-asc":
      return (a.item.name ?? "").localeCompare(b.item.name ?? "");
    case "name-desc":
      return (b.item.name ?? "").localeCompare(a.item.name ?? "");
    case "author-asc":
      return (a.item.author ?? "").localeCompare(b.item.author ?? "");
    case "population-desc": {
      const popA = a.type === "maps" ? (a.item as types.MapManifest).population ?? 0 : -1;
      const popB = b.type === "maps" ? (b.item as types.MapManifest).population ?? 0 : -1;
      return popB - popA;
    }
    default:
      return 0;
  }
}

export function useFilteredItems({ mods, maps }: UseFilteredItemsParams) {
  const defaultPerPage = useProfileStore((s) => s.defaultPerPage)() as PerPage;
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<PerPage>(defaultPerPage);

  useEffect(() => {
    setPerPage(defaultPerPage);
  }, [defaultPerPage]);

  const prevFiltersRef = useRef({ query, type, selectedTags, sort, perPage });
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev.query !== query ||
      prev.type !== type ||
      prev.selectedTags !== selectedTags ||
      prev.sort !== sort ||
      prev.perPage !== perPage
    ) {
      setPage(1);
      prevFiltersRef.current = { query, type, selectedTags, sort, perPage };
    }
  }, [query, type, selectedTags, sort, perPage]);

  const allItems = useMemo<TaggedItem[]>(() => {
    const modItems: TaggedItem[] = (mods || []).map((m) => ({ type: "mods" as const, item: m }));
    const mapItems: TaggedItem[] = (maps || []).map((m) => ({ type: "maps" as const, item: m }));
    return [...modItems, ...mapItems];
  }, [mods, maps]);

  const filtered = useMemo(() => {
    let result = allItems;

    if (type !== "all") {
      result = result.filter((i) => i.type === type);
    }

    if (query.trim()) {
      result = result.filter((i) => matchesQuery(i, query.trim()));
    }

    if (selectedTags.length > 0) {
      result = result.filter((i) => matchesTags(i, selectedTags));
    }

    return [...result].sort((a, b) => compareItems(a, b, sort));
  }, [allItems, query, type, selectedTags, sort]);

  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / perPage));

  const items = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  return {
    items,
    page,
    totalPages,
    totalResults,
    query,
    type,
    selectedTags,
    sort,
    perPage,
    setQuery: useCallback((v: string) => setQuery(v), []),
    setType: useCallback((v: TypeFilter) => setType(v), []),
    setSelectedTags: useCallback((v: string[]) => setSelectedTags(v), []),
    setSort: useCallback((v: SortOption) => setSort(v), []),
    setPage: useCallback((v: number) => setPage(v), []),
    setPerPage: useCallback((v: PerPage) => setPerPage(v), []),
  };
}
