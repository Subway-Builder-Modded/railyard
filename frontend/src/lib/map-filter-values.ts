import type { types } from '../../wailsjs/go/models';

export interface MapFilterValues {
  locations: string[];
  sourceQuality: string[];
  levelOfDetail: string[];
  specialDemand: string[];
}

const SOURCE_QUALITY_LABELS: Record<string, string> = {
  'low-quality': 'low-data-quality',
  'medium-quality': 'medium-data-quality',
  'high-quality': 'high-data-quality',
};

export function formatSourceQuality(value: string): string {
  return SOURCE_QUALITY_LABELS[value] ?? value;
}

function buildUniqueSortedValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

export function buildMapFilterValues(
  maps: readonly types.MapManifest[],
): MapFilterValues {
  return {
    locations: buildUniqueSortedValues(maps.map((map) => map.location)),
    sourceQuality: buildUniqueSortedValues(
      maps.map((map) => map.source_quality),
    ),
    levelOfDetail: buildUniqueSortedValues(
      maps.map((map) => map.level_of_detail),
    ),
    specialDemand: buildUniqueSortedValues(
      maps.flatMap((map) => map.special_demand ?? []),
    ),
  };
}
