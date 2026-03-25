export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'opening';
export type ToolType = 'move' | ElementType;
export type CabinetKey = 'compact' | 'standard' | 'large' | 'industrial';

export interface CabinetSpec {
  name: string;
  w: number;
  h: number;
  d: number;
  basePrice: number;
  description: string;
}

export interface PanelElement {
  id: number;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  diameter?: number;
}

export type SideElements = Record<Side, PanelElement[]>;
