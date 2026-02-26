import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Package, MapPin, LayoutGrid } from "lucide-react";

interface TypeToggleProps {
  value: "all" | "mods" | "maps";
  onChange: (value: "all" | "mods" | "maps") => void;
}

export function TypeToggle({ value, onChange }: TypeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as "all" | "mods" | "maps");
      }}
    >
      <ToggleGroupItem value="all" aria-label="All">
        <LayoutGrid className="h-4 w-4 mr-1.5" />
        All
      </ToggleGroupItem>
      <ToggleGroupItem value="mods" aria-label="Mods">
        <Package className="h-4 w-4 mr-1.5" />
        Mods
      </ToggleGroupItem>
      <ToggleGroupItem value="maps" aria-label="Maps">
        <MapPin className="h-4 w-4 mr-1.5" />
        Maps
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
