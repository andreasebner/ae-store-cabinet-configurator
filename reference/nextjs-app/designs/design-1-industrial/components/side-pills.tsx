'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { SIDES } from '@/lib/constants';
import { Side } from '@/lib/types';

export default function SidePills() {
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const setSide = useConfiguratorStore(s => s.setSide);
  const sideElements = useConfiguratorStore(s => s.sideElements);

  return (
    <div className="px-4 pb-3 bg-[#12141A]">
      <div className="flex gap-1 justify-center">
        {SIDES.map(side => {
          const hasEdits = sideElements[side].length > 0;
          const isActive = side === currentSide;
          return (
            <button
              key={side}
              onClick={() => setSide(side)}
              className={`relative px-3.5 py-1 rounded-sm text-[10px] font-bold font-mono uppercase tracking-wider border transition-all
                ${isActive
                  ? 'bg-[#FF6B2C] border-[#FF6B2C] text-white shadow-[0_0_10px_rgba(255,107,44,0.25)]'
                  : 'bg-[#1A1D23] border-[#3A3F4A] text-[#6B7280] hover:border-[#FF6B2C]/50 hover:text-[#FF6B2C]'
                }`}
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
              {hasEdits && (
                <span className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] bg-[#F5A623] rounded-sm border-[1.5px] border-[#12141A]" />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-center pt-1.5 pb-1 text-[10px] text-[#4B5563] font-mono uppercase tracking-wider">Click a side or drag to rotate</p>
    </div>
  );
}
