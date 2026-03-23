import { ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'wouter';

interface QuickNavCardProps {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

export function QuickNavCard({
  href,
  icon: Icon,
  label,
  description,
}: QuickNavCardProps) {
  return (
    <Link href={href} className="block">
      <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background/60 px-4 py-3 transition-all duration-150 hover:border-foreground/20 hover:bg-background hover:shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors duration-150 group-hover:bg-accent group-hover:text-accent-foreground">
          <Icon className="h-[1.1em] w-[1.1em]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-none text-foreground">
            {label}
          </span>
          <span className="mt-1 block truncate text-xs leading-snug text-muted-foreground">
            {description}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-border transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}
