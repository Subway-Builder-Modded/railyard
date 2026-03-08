import { cn } from "@/lib/utils";
import { LayoutGrid, Package, MapPin, Tag, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface SidebarFiltersProps {
  type: "all" | "mods" | "maps";
  onTypeChange: (type: "all" | "mods" | "maps") => void;
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  modCount: number;
  mapCount: number;
}

const typeOptions = [
  { value: "all" as const, label: "All", icon: LayoutGrid },
  { value: "mods" as const, label: "Mods", icon: Package },
  { value: "maps" as const, label: "Maps", icon: MapPin },
];

export function SidebarFilters({
  type,
  onTypeChange,
  availableTags,
  selectedTags,
  onTagsChange,
  modCount,
  mapCount,
}: SidebarFiltersProps) {
  const [tagsOpen, setTagsOpen] = useState(false);

  const toggleTag = (tag: string) => {
    onTagsChange(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  const counts: Record<string, number> = {
    all: modCount + mapCount,
    mods: modCount,
    maps: mapCount,
  };

  return (
    <div className="space-y-5">
      {/* Type filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Type
        </p>
        <nav className="space-y-0.5" aria-label="Content type filter">
          {typeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onTypeChange(value)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                type === value
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
              )}
              aria-current={type === value ? "true" : undefined}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  type === value ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {counts[value]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <Separator />

      {/* Tags filter */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Tags
        </p>
        <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between text-sm font-normal"
            >
              <span className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {selectedTags.length > 0
                  ? `${selectedTags.length} selected`
                  : "Filter by tag"}
              </span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-xs">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {availableTags.map((tag) => (
                    <CommandItem key={tag} onSelect={() => toggleTag(tag)}>
                      <Checkbox
                        checked={selectedTags.includes(tag)}
                        className="mr-2"
                        aria-hidden="true"
                      />
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Active tag chips */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 cursor-pointer pr-1"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="h-2.5 w-2.5" aria-label={`Remove ${tag} filter`} />
              </Badge>
            ))}
            <button
              onClick={() => onTagsChange([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
