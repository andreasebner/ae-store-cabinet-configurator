'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { SIDES } from '@/lib/constants';
import type { Side } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SidePills() {
  const { currentSide, setSide, sideElements } = useConfiguratorStore();

  return (
    <div className="p-3 border-b">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Panel Side</h3>
      <div className="flex flex-wrap gap-1.5">
        {SIDES.map(side => {
          const count = sideElements[side]?.length || 0;
          const active = currentSide === side;
          return (
            <Button
              key={side}
              variant={active ? 'default' : 'outline'}
              size="sm"
              className={cn('capitalize gap-1.5 h-8', !active && count > 0 && 'border-primary/30')}
              onClick={() => setSide(side)}
            >
              {side}
              {count > 0 && (
                <Badge
                  variant={active ? 'secondary' : 'outline'}
                  className={cn('h-4 min-w-[16px] px-1 text-[10px]', active && 'bg-primary-foreground/20 text-primary-foreground')}
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
