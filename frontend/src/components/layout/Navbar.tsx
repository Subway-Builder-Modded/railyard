import {
  BookOpen,
  Play,
  RefreshCw,
  ScrollText,
  Settings,
  Square,
  TrainTrack,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link, useLocation } from 'wouter';

import {
  APP_SHELL_PADDING_CLASS,
  APP_SHELL_WIDTH_CLASS,
} from '@/components/layout/layout-shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/stores/config-store';
import { useGameStore } from '@/stores/game-store';
import { useInstalledStore } from '@/stores/installed-store';
import { useRegistryStore } from '@/stores/registry-store';

const navLinks = [
  {
    href: '/library',
    label: 'Library',
    icon: BookOpen,
    isCurrent: (location: string) => location.startsWith('/library'),
  },
  {
    href: '/search',
    label: 'Browse',
    icon: TrainTrack,
    isCurrent: (location: string) =>
      location.startsWith('/search') || location.startsWith('/project'),
  },
  {
    href: '/logs',
    label: 'Logs',
    icon: ScrollText,
    isCurrent: (location: string) => location.startsWith('/logs'),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    isCurrent: (location: string) => location.startsWith('/settings'),
  },
] as const;

const MOD_REMINDER_KEY = 'railyard:mod-reminder-acknowledged';

export function Navbar() {
  const [location] = useLocation();
  const { refresh, loading, refreshing } = useRegistryStore();
  const canLaunch = useConfigStore((s) => s.validation?.executablePathValid);
  const { running, launch, stop } = useGameStore();
  const installedMaps = useInstalledStore((s) => s.installedMaps);
  const [showModReminder, setShowModReminder] = useState(false);

  const runWithToast = async (
    action: () => Promise<void>,
    fallbackMessage: string,
  ) => {
    try {
      await action();
    } catch (err) {
      toast.error(String(err) || fallbackMessage);
    }
  };

  const handleLaunch = async () => {
    const hasMaps = installedMaps.length > 0;
    const alreadyAcknowledged =
      localStorage.getItem(MOD_REMINDER_KEY) === 'true';

    if (hasMaps && !alreadyAcknowledged) {
      setShowModReminder(true);
      return;
    }

    await runWithToast(launch, 'Failed to launch game.');
  };

  const handleAcknowledgeAndLaunch = async () => {
    localStorage.setItem(MOD_REMINDER_KEY, 'true');
    setShowModReminder(false);
    await runWithToast(launch, 'Failed to launch game.');
  };

  const handleStop = async () => runWithToast(stop, 'Failed to stop game.');

  return (
    <header className="sticky top-0 z-50 py-3">
      <div className={cn(APP_SHELL_WIDTH_CLASS, APP_SHELL_PADDING_CLASS)}>
        <div className="flex min-h-[4rem] flex-wrap items-center justify-between gap-y-2 rounded-2xl border border-border/70 bg-background/90 px-[clamp(0.8rem,2vw,1.4rem)] py-1.5 shadow-sm backdrop-blur-md">
          <div className="flex min-w-0 flex-wrap items-center gap-[clamp(0.6rem,1.8vw,1.25rem)]">
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[clamp(1rem,1.55vw,1.15rem)] font-extrabold tracking-[0.01em] text-foreground transition-colors hover:text-primary"
            >
              <TrainTrack className="h-[1.2em] w-[1.2em]" />
              <span>Railyard</span>
            </Link>
            <nav className="flex max-w-full items-center gap-1.5 overflow-x-auto">
              {navLinks.map(({ href, label, icon: Icon, isCurrent }) => {
                const current = isCurrent(location);

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={current ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center gap-2 rounded-lg px-[clamp(0.45rem,0.95vw,0.7rem)] py-[clamp(0.45rem,0.92vw,0.62rem)] text-[clamp(0.89rem,1.1vw,1rem)] font-semibold text-white transition-all duration-150',
                      current
                        ? 'text-primary bg-accent/45'
                        : 'hover:text-primary hover:bg-accent/45',
                    )}
                  >
                    <Icon className="h-[1.05em] w-[1.05em] shrink-0 text-white transition-colors group-hover:text-primary group-aria-[current=page]:text-primary" />
                    <span>{label}</span>
                    {current && (
                      <span
                        aria-hidden
                        className="absolute -bottom-[0.35rem] left-2 right-2 h-1 rounded-full bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-1.5">
            {running ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="text-destructive hover:text-destructive"
              >
                <Square className="mr-1.5 h-[1.125rem] w-[1.125rem]" />
                Running
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLaunch}
                      disabled={!canLaunch}
                    >
                      <Play className="mr-1.5 h-[1.125rem] w-[1.125rem]" />
                      Launch
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canLaunch && (
                  <TooltipContent>
                    Configure game executable in Settings first
                  </TooltipContent>
                )}
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={refresh}
              disabled={loading || refreshing}
            >
              <RefreshCw
                className={cn(
                  'h-[1.125rem] w-[1.125rem]',
                  (loading || refreshing) && 'animate-spin',
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showModReminder} onOpenChange={setShowModReminder}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Enable Railyard Map Loader</DialogTitle>
            <DialogDescription>
              You have custom maps installed. To use them in-game, make sure the{' '}
              <span className="font-semibold text-foreground">
                Railyard Map Loader
              </span>{' '}
              mod is enabled in the game's mod manager.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModReminder(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledgeAndLaunch}>
              Got it, launch game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
