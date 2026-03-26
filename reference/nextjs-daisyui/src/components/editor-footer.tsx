'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';
import { SNAP_GRID } from '@/lib/constants';

export function EditorFooter() {
  const { sideElements, currentSide, zoomLevel } = useConfiguratorStore();
  const count = sideElements[currentSide].length;

  return (
    <div className="flex items-center justify-between px-3 py-1 border-t border-base-300 bg-base-100 text-xs text-base-content/50">
      <span>
        ℹ {count} element{count !== 1 ? 's' : ''} · Grid {SNAP_GRID}mm · Zoom {Math.round(zoomLevel * 100)}%
      </span>
      <span className="flex gap-2">
        <kbd>V</kbd> Hole
        <kbd>H</kbd> Rect
        <kbd>O</kbd> Opening
        <kbd>M</kbd> Move
        <kbd>Del</kbd> Delete
      </span>
    </div>
  );
}
