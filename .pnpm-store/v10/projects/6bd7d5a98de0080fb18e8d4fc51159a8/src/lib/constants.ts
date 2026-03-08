export const PER_PAGE_OPTIONS = [12, 24, 48] as const;
export type PerPage = typeof PER_PAGE_OPTIONS[number];

export const SORT_OPTIONS = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "author-asc", label: "Author A-Z" },
  { value: "population-desc", label: "Population" },
] as const;
export type SortOption = typeof SORT_OPTIONS[number]["value"];
