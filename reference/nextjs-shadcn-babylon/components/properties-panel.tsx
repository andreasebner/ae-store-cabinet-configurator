'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { ELEMENT_PRICES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trash2, CircleDot, RectangleHorizontal, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PropertiesPanel() {
  const { selectedElId, currentElements, updateElementProp, deleteElement } = useConfiguratorStore();
  const els = currentElements();
  const el = selectedElId !== null ? els.find(e => e.id === selectedElId) : null;

  const handleChange = (prop: string, value: string) => {
    const n = Number(value);
    if (!isNaN(n) && el) updateElementProp(el.id, prop, n);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'hole': return <CircleDot className="h-4 w-4 text-amber-500" />;
      case 'rect': return <Square className="h-4 w-4 text-sky-500" />;
      case 'opening': return <RectangleHorizontal className="h-4 w-4 text-emerald-500" />;
      default: return null;
    }
  };

  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case 'hole': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rect': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'opening': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return '';
    }
  };

  if (!el) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <MouseIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No element selected</p>
        <p className="text-xs text-muted-foreground mt-1">Click an element on the panel<br />to view and edit its properties</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h3>
        <Badge variant="outline" className={cn('capitalize text-[10px]', typeBadgeVariant(el.type))}>
          {el.type}
        </Badge>
      </div>

      {/* Type header */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {typeIcon(el.type)}
            <span className="capitalize">{el.type}</span>
            <span className="text-xs text-muted-foreground ml-auto">€{ELEMENT_PRICES[el.type]?.toFixed(2)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-[10px] text-muted-foreground font-mono">ID: {el.id}</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Position */}
      <div>
        <h4 className="text-xs font-medium mb-2">Position</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">X (mm)</label>
            <Input type="number" step={5} min={0} value={el.x} onChange={e => handleChange('x', e.target.value)} className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Y (mm)</label>
            <Input type="number" step={5} min={0} value={el.y} onChange={e => handleChange('y', e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-xs font-medium mb-2">Dimensions</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground">Width</label>
            <Input type="number" step={1} min={5} value={el.w} onChange={e => handleChange('w', e.target.value)} className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground">Height</label>
            <Input type="number" step={1} min={5} value={el.h} onChange={e => handleChange('h', e.target.value)} className="h-8 text-xs" />
          </div>
          {el.type === 'hole' && el.diameter !== undefined && (
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground">Diameter (mm)</label>
              <Input type="number" step={1} min={1} value={el.diameter} onChange={e => handleChange('diameter', e.target.value)} className="h-8 text-xs" />
            </div>
          )}
        </div>
      </div>

      <Separator />

      <Button variant="destructive" size="sm" className="w-full gap-2" onClick={() => deleteElement(el.id)}>
        <Trash2 className="h-3.5 w-3.5" />
        Delete Element
      </Button>
    </div>
  );
}

function MouseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12l3-3 3 3" /><path d="M6 9v12" /><rect width="10" height="14" x="11" y="5" rx="2" />
    </svg>
  );
}
