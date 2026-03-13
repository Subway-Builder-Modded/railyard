import { create } from "zustand";
import type { AssetType } from "@/lib/asset-types";
import { DEFAULT_SORT_STATE, type PerPage, type SortState } from "@/lib/constants";

export type LibraryTypeFilter = AssetType;

function createRandomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

export interface LibraryFilterState {
  query: string;
  type: LibraryTypeFilter;
  perPage: PerPage;
  sort: SortState;
  randomSeed: number;
  mod: {
    tags: string[];
  };
  map: {
    locations: string[];
    sourceQuality: string[];
    levelOfDetail: string[];
    specialDemand: string[];
  };
}

type LibraryFilterUpdater =
  | LibraryFilterState
  | ((prev: LibraryFilterState) => LibraryFilterState);

interface LibraryState {
  filters: LibraryFilterState;
  page: number;
  selectedIds: Set<string>;
  setFilters: (updater: LibraryFilterUpdater) => void;
  setPage: (page: number) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

const defaultLibraryFilters: LibraryFilterState = {
  query: "",
  type: "mod",
  perPage: 12,
  sort: {
    ...DEFAULT_SORT_STATE,
    field: "name",
    direction: "asc",
  },
  randomSeed: createRandomSeed(),
  mod: {
    tags: [],
  },
  map: {
    locations: [],
    sourceQuality: [],
    levelOfDetail: [],
    specialDemand: [],
  },
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  filters: defaultLibraryFilters,
  page: 1,
  selectedIds: new Set<string>(),
  setFilters: (updater) =>
    set((state) => ({
      filters:
        typeof updater === "function" ? updater(state.filters) : updater,
    })),
  setPage: (page) => set({ page }),
  toggleSelected: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  isSelected: (id) => get().selectedIds.has(id),
}));
