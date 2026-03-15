import { create } from 'zustand';

import type { AssetType } from '@/lib/asset-types';
import {
  DEFAULT_SORT_STATE,
  type PerPage,
  type SortState,
} from '@/lib/constants';
import {
  createTypeScopedByAssetType,
  switchTypeScopedState,
  syncCurrentTypeScopedState,
  type TypeScopedByAssetType,
} from '@/stores/type-scoped-filter-state';

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
  scopedByType: TypeScopedByAssetType;
  selectedIds: Set<string>;
  setFilters: (updater: LibraryFilterUpdater) => void;
  setType: (type: LibraryTypeFilter) => void;
  setPage: (page: number) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
}

const defaultLibraryFilters: LibraryFilterState = {
  query: '',
  type: 'mod',
  perPage: 12,
  sort: {
    ...DEFAULT_SORT_STATE,
    field: 'name',
    direction: 'asc',
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

const defaultLibraryScopedByType = createTypeScopedByAssetType(
  defaultLibraryFilters,
  1,
);

export const useLibraryStore = create<LibraryState>((set, get) => ({
  filters: defaultLibraryFilters,
  page: 1,
  scopedByType: defaultLibraryScopedByType,
  selectedIds: new Set<string>(),
  setFilters: (updater) =>
    set((state) => {
      const nextFilters =
        typeof updater === 'function' ? updater(state.filters) : updater;
      return {
        filters: nextFilters,
        scopedByType: syncCurrentTypeScopedState(
          state.scopedByType,
          nextFilters,
          state.page,
        ),
      };
    }),
  setType: (type) =>
    set((state) => switchTypeScopedState(state.filters, state.page, state.scopedByType, type)),
  setPage: (page) =>
    set((state) => ({
      page,
      scopedByType: syncCurrentTypeScopedState(
        state.scopedByType,
        state.filters,
        page,
      ),
    })),
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
