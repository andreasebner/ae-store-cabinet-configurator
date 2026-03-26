export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'opening';
export type ToolType = 'select' | 'hole' | 'rect' | 'opening' | 'measure';
export type ViewMode = 'perspective' | 'front' | 'top' | 'side';
export type CabinetKey = 'compact' | 'standard' | 'large' | 'xlarge';

export interface CabinetSpec {
  w: number; h: number; d: number; base: number; label: string;
}

export interface PanelElement {
  id: number; type: ElementType;
  x: number; y: number; w: number; h: number; diameter?: number;
}

export type SideElements = Record<Side, PanelElement[]>;
