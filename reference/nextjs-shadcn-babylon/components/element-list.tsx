'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircleDot, Square, RectangleHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ElementList() {
  const { currentSide, selectedElId, selectElement, currentElements } = useConfiguratorStore();
  const els = currentElements();

  const typeIcon = (type: string) => {
    switch (type) {
      case 'hole': return <CircleDot className="h-3 w-3 text-amber-500" />;
      case 'rect': return <Square className="h-3 w-3 text-sky-500" />;
      case 'opening': return <RectangleHorizontal className="h-3 w-3 text-emerald-500" />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 overflow-auto p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Elements
        </h3>
        <Badge variant="secondary" className="text-[10px]">
          <span className="capitalize">{currentSide}</span> • {els.length}
        </Badge>
      </div>

      {els.length === 0 ? (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          No elements yet.<br />Select a tool and click the panel.
        </p>
      ) : (
        <div className="space-y-0.5">
          {els.map(el => (
            <Button
              key={el.id}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start h-8 px-2 gap-2 text-xs font-normal',
                selectedElId === el.id && 'bg-accent text-accent-foreground'
              )}
              onClick={() => selectElement(el.id)}
            >
              {typeIcon(el.type)}
              <span className="capitalize">{el.type}</span>
              <span className="text-muted-foreground ml-auto font-mono text-[10px]">{el.x},{el.y}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
