'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, formatDimensions } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function EditorFooter() {
  const { currentCabinet, currentSide, zoomLevel, setZoom, currentElements } = useConfiguratorStore();
  const els = currentElements();

  return (
    <div className="h-9 border-t bg-card flex items-center px-4 justify-between text-xs text-muted-foreground shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-medium">{CABINETS[currentCabinet].label}</span>
        <Separator orientation="vertical" className="h-4" />
        <span className="capitalize">{currentSide}</span>
        <Separator orientation="vertical" className="h-4" />
        <span>{formatDimensions(currentCabinet)}</span>
        <Separator orientation="vertical" className="h-4" />
        <span>{els.length} element{els.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex items-center gap-2">
        <span>Zoom</span>
        <Select value={String(zoomLevel)} onValueChange={v => setZoom(Number(v))}>
          <SelectTrigger className="h-6 w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ZOOM_LEVELS.map(z => (
              <SelectItem key={z} value={String(z)}>{Math.round(z * 100)}%</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
