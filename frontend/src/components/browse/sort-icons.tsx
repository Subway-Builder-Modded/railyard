import {
  ArrowDown,
  ArrowDownAZ,
  ArrowDownZA,
  ArrowUp,
  ArrowUpAZ,
  CalendarArrowDown,
  CalendarArrowUp,
  Download,
  Shuffle,
  User,
  Users,
} from 'lucide-react';

import type { SortOption } from '@/lib/constants';

export function SortOptionIcon({ option }: { option: SortOption }) {
  const { field, direction } = option.sort;

  const baseIconClass = 'h-4 w-4 text-current';
  const secondaryIconClass = 'h-3.5 w-3.5 text-current opacity-70';

  if (field === 'random') return <Shuffle className={baseIconClass} aria-hidden />;

  if (field === 'last_updated') {
    const Icon = direction === 'asc' ? CalendarArrowUp : CalendarArrowDown;
    return <Icon className={baseIconClass} aria-hidden />;
  }

  if (field === 'downloads') {
    return (
      <span className="flex items-center gap-1" aria-hidden>
        <Download className={baseIconClass} />
        {direction === 'asc' ? (
          <ArrowUp className={secondaryIconClass} />
        ) : (
          <ArrowDown className={secondaryIconClass} />
        )}
      </span>
    );
  }

  if (field === 'population') {
    return (
      <span className="flex items-center gap-1" aria-hidden>
        <Users className={baseIconClass} />
        {direction === 'asc' ? (
          <ArrowUp className={secondaryIconClass} />
        ) : (
          <ArrowDown className={secondaryIconClass} />
        )}
      </span>
    );
  }

  if (field === 'author') {
    return (
      <span className="flex items-center gap-1" aria-hidden>
        <User className={baseIconClass} />
        {direction === 'asc' ? (
          <ArrowUpAZ className={secondaryIconClass} />
        ) : (
          <ArrowDownZA className={secondaryIconClass} />
        )}
      </span>
    );
  }

  if (field === 'name' || field === 'city_code' || field === 'country') {
    const Icon = direction === 'asc' ? ArrowDownAZ : ArrowDownZA;
    return <Icon className={baseIconClass} aria-hidden />;
  }

  return direction === 'asc' ? (
    <ArrowUp className={baseIconClass} aria-hidden />
  ) : (
    <ArrowDown className={baseIconClass} aria-hidden />
  );
}

