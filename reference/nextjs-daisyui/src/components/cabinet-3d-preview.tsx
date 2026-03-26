'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';
import { CABINETS, SIDES, SIDE_ROTATIONS } from '@/lib/constants';
import type { Side, PanelElement } from '@/lib/types';

const S = 0.28;

export function Cabinet3DPreview() {
  const { currentCabinet, currentSide, sideElements, setSide } = useConfiguratorStore();
  const cab = CABINETS[currentCabinet];
  const cw = cab.w * S, ch = cab.h * S, cd = cab.d * S;
  const rot = SIDE_ROTATIONS[currentSide];

  const faceStyles: Record<Side, string> = {
    front:  `width:${cw}px;height:${ch}px;transform:translateZ(${cd/2}px)`,
    back:   `width:${cw}px;height:${ch}px;transform:rotateY(180deg) translateZ(${cd/2}px)`,
    left:   `width:${cd}px;height:${ch}px;transform:rotateY(-90deg) translateZ(${cw/2}px)`,
    right:  `width:${cd}px;height:${ch}px;transform:rotateY(90deg) translateZ(${cw/2}px)`,
    top:    `width:${cw}px;height:${cd}px;transform:rotateX(90deg) translateZ(${ch/2}px)`,
    bottom: `width:${cw}px;height:${cd}px;transform:rotateX(-90deg) translateZ(${ch/2}px)`,
  };

  function elPos(el: PanelElement, side: Side) {
    const fw = ['left','right'].includes(side) ? cab.d : cab.w;
    const fh = ['top','bottom'].includes(side) ? cab.d : cab.h;
    return {
      left: `${(el.x/fw)*100}%`, top: `${(el.y/fh)*100}%`,
      width: `${(el.w/fw)*100}%`, height: `${(el.h/fh)*100}%`,
      borderRadius: el.type === 'hole' ? '50%' : '2px',
      background: el.type === 'hole' ? '#4f46e5' : el.type === 'rect' ? '#06b6d4' : '#f59e0b',
    };
  }

  return (
    <div style={{ perspective: 600 }} className="flex items-center justify-center w-full h-full">
      <div
        className="relative preserve-3d side-transition"
        style={{ width: cw, height: ch, transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
      >
        {SIDES.map(side => (
          <div
            key={side}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer border transition-colors
              ${side === currentSide ? 'border-primary bg-primary/15' : 'border-primary/20 bg-primary/5 hover:bg-primary/10'}`}
            style={{ ...parseStyle(faceStyles[side]), backfaceVisibility: 'visible' }}
            onClick={() => setSide(side)}
          >
            <span className="text-[10px] uppercase tracking-widest text-primary/50 pointer-events-none">{side}</span>
            {sideElements[side].map(el => (
              <div key={el.id} className="absolute opacity-80 pointer-events-none" style={elPos(el, side)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function parseStyle(s: string): Record<string, string> {
  const o: Record<string, string> = {};
  s.split(';').forEach(p => {
    const [k, v] = p.split(':').map(x => x.trim());
    if (k && v) o[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
  });
  return o;
}
