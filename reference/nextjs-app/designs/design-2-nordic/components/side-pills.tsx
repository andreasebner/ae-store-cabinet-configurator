'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { SIDES } from '@/lib/constants';
import { Side } from '@/lib/types';

export default function SidePills() {
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const setSide = useConfiguratorStore(s => s.setSide);
  const sideElements = useConfiguratorStore(s => s.sideElements);

  return (
    <div className="px-5 pb-4 bg-[#F5F2EE]">
      <div className="flex gap-2 justify-center">
        {SIDES.map(side => {
          const hasEdits = sideElements[side].length > 0;
          const isActive = side === currentSide;
          return (
            <button
              key={side}
              onClick={() => setSide(side)}
              className={`relative px-5 py-2 rounded-2xl text-[12px] font-semibold transition-all
                ${isActive
                  ? 'bg-[#C4644A] text-white shadow-[0_3px_12px_rgba(196,100,74,0.25)]'
                  : 'bg-white/80 text-[#8A817A] hover:bg-white hover:text-[#C4644A] shadow-[0_1px_4px_rgba(61,53,50,0.04)]'
                }`}
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
              {hasEdits && (
                <span className={`absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full border-2
                  ${isActive ? 'bg-white border-[#C4644A]' : 'bg-[#C4644A] border-white'}`}
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="text-center pt-2 pb-1 text-[11px] text-[#A69E97] font-medium">Click a side or drag to rotate</p>
    </div>
  );
}
