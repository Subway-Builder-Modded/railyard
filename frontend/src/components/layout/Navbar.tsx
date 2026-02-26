import { Link, useLocation } from "wouter";
import { RefreshCw, TrainTrack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegistryStore } from "@/stores/registry-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Browse" },
] as const;

export function Navbar() {
  const [location] = useLocation();
  const { refresh, loading } = useRegistryStore();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <TrainTrack className="h-5 w-5" />
            Railyard
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  location === href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <Button variant="ghost" size="icon" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>
    </header>
  );
}
