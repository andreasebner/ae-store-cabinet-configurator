export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'opening';
export type ToolType = ElementType | 'move';
export type CabinetKey = 'compact' | 'standard' | 'large' | 'industrial';

export interface CabinetSpec { name: string; w: number; h: number; d: number; basePrice: number; }
export interface PanelElement {
  id: number; type: ElementType;
  x: number; y: number; w: number; h: number;
  diameter?: number;
}
export type SideElements = Record<Side, PanelElement[]>;
