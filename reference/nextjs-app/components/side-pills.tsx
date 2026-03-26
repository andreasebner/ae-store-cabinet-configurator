'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { SIDES } from '@/lib/constants';
import { Side } from '@/lib/types';

export default function SidePills() {
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const setSide = useConfiguratorStore(s => s.setSide);
  const sideElements = useConfiguratorStore(s => s.sideElements);

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-1.5 justify-center">
        {SIDES.map(side => {
          const hasEdits = sideElements[side].length > 0;
          const isActive = side === currentSide;
          return (
            <button
              key={side}
              onClick={() => setSide(side)}
              className={`relative px-3.5 py-1 rounded-full text-xs font-medium border transition-all
                ${isActive
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'bg-white/70 backdrop-blur-sm border-gray-200 text-gray-500 hover:border-indigo-500 hover:text-indigo-500'
                }`}
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
              {hasEdits && (
                <span className="absolute -top-0.5 -right-0.5 w-[5px] h-[5px] bg-amber-500 rounded-full border-[1.5px] border-white" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-center pt-1 pb-1 text-[11px] text-gray-400">Click a side or drag to rotate</p>
    </div>
  );
}
