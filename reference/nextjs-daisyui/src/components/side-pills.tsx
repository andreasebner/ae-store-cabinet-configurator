'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';
import { SIDES } from '@/lib/constants';
import type { Side } from '@/lib/types';

const ICONS: Record<Side, string> = {
  front: '▣', back: '▣', left: '◧', right: '◨', top: '⬒', bottom: '⬓',
};

export function SidePills() {
  const { currentSide, setSide, sideElements } = useConfiguratorStore();

  return (
    <div className="flex flex-col gap-1">
      {SIDES.map(side => (
        <button
          key={side}
          className={`btn btn-sm btn-ghost gap-1 justify-start relative ${
            side === currentSide ? 'btn-active bg-primary/10 text-primary' : ''
          }`}
          onClick={() => setSide(side)}
        >
          <span className="text-sm">{ICONS[side]}</span>
          <span className="text-xs capitalize">{side}</span>
          {sideElements[side].length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>
      ))}
    </div>
  );
}
