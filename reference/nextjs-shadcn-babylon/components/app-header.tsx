'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { CABINETS, formatDimensions } from '@/lib/constants';
import type { CabinetKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Zap } from 'lucide-react';

export default function AppHeader() {
  const { currentCabinet, setCabinet, price, cartItems, addToCart } = useConfiguratorStore();

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <span className="font-bold text-lg">CabinetPro</span>
        <Badge variant="secondary" className="text-[10px]">shadcn + Babylon</Badge>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Cabinet selector */}
      <Select value={currentCabinet} onValueChange={(v) => setCabinet(v as CabinetKey)}>
        <SelectTrigger className="w-56 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CABINETS).map(([key, spec]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center justify-between w-full gap-4">
                <span>{spec.label}</span>
                <span className="text-xs text-muted-foreground">{spec.w}×{spec.h}×{spec.d}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-xs text-muted-foreground">{formatDimensions(currentCabinet)}</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Price */}
      <div className="text-right">
        <div className="text-xs text-muted-foreground">Total</div>
        <div className="text-lg font-bold text-primary">€{price.toFixed(2)}</div>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Cart */}
      <Button onClick={addToCart} className="gap-2">
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
        {cartItems > 0 && (
          <Badge variant="secondary" className="ml-1 bg-primary-foreground/20">{cartItems}</Badge>
        )}
      </Button>
    </header>
  );
}
