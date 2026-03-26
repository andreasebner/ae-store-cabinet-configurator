'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import type { ToolType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { MousePointer2, Circle, Square, RectangleHorizontal, Undo2, Redo2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOLS: { key: ToolType; label: string; icon: React.ElementRef<any>; shortcut: string; Icon: React.ComponentType<any> }[] = [
  { key: 'move', label: 'Move / Select', icon: null as any, shortcut: 'V', Icon: MousePointer2 },
  { key: 'hole', label: 'Add Hole', icon: null as any, shortcut: 'H', Icon: Circle },
  { key: 'rect', label: 'Add Rectangle', icon: null as any, shortcut: 'R', Icon: Square },
  { key: 'opening', label: 'Add Opening', icon: null as any, shortcut: 'O', Icon: RectangleHorizontal },
];

export default function EditorToolbar() {
  const { activeTool, setTool, undoStack, redoStack, undo, redo, clearCurrentSide, currentSide } = useConfiguratorStore();

  return (
    <div className="h-11 border-b bg-card flex items-center px-3 gap-1 shrink-0">
      {TOOLS.map(t => (
        <Tooltip key={t.key}>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === t.key ? 'default' : 'ghost'}
              size="sm"
              className={cn('h-8 gap-1.5', activeTool === t.key && 'shadow-sm')}
              onClick={() => setTool(t.key)}
            >
              <t.Icon className="h-4 w-4" />
              <span className="text-xs">{t.label.split(' ').pop()}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.label} ({t.shortcut})</TooltipContent>
        </Tooltip>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={undoStack.length === 0} onClick={undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={redoStack.length === 0} onClick={redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5" onClick={clearCurrentSide}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="text-xs capitalize">Clear {currentSide}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove all elements from this side</TooltipContent>
      </Tooltip>
    </div>
  );
}
