'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';
import type { ElementType } from '@/lib/types';

const ICON: Record<ElementType, string> = { hole: '○', rect: '□', opening: '▢' };

export function ElementList() {
  const { sideElements, currentSide, selectedElId, selectElement, deleteElement } = useConfiguratorStore();
  const elements = sideElements[currentSide];

  return (
    <div className="flex-1 overflow-y-auto p-3">
      <div className="text-xs uppercase tracking-wider text-base-content/50 mb-2">
        Elements · <span className="capitalize">{currentSide}</span>
        <div className="badge badge-xs badge-ghost ml-1">{elements.length}</div>
      </div>

      {elements.length > 0 ? (
        <ul className="menu menu-sm bg-base-100 rounded-box p-0 gap-0.5">
          {elements.map(el => (
            <li key={el.id}>
              <a
                className={`flex items-center gap-2 ${el.id === selectedElId ? 'active' : ''}`}
                onClick={() => selectElement(el.id)}
              >
                <span>{ICON[el.type]}</span>
                <span className="capitalize flex-1">{el.type}
                  <span className="text-base-content/40 text-xs ml-1">
                    {el.type === 'hole' ? `⌀${el.diameter}` : `${el.w}×${el.h}`}
                  </span>
                </span>
                <span className="text-xs text-base-content/40">({el.x}, {el.y})</span>
                <button
                  className="btn btn-ghost btn-xs btn-square text-error"
                  onClick={e => { e.stopPropagation(); deleteElement(el.id); }}
                >✕</button>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center h-28 text-base-content/30">
          <span className="text-3xl mb-1">📦</span>
          <span className="text-xs">No elements on this side</span>
          <span className="text-xs">Click the panel to add</span>
        </div>
      )}
    </div>
  );
}
