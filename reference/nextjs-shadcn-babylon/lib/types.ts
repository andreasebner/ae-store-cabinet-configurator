export type Side = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
export type ElementType = 'hole' | 'rect' | 'opening';
export type ToolType = 'move' | ElementType;
export type ViewMode = '3d' | '2d';
export type CabinetKey = 'compact' | 'standard' | 'large' | 'xlarge';

export interface CabinetSpec {
  w: number; h: number; d: number;
  base: number; label: string;
}

export interface PanelElement {
  id: string;
  type: ElementType;
  x: number; y: number;
  w: number; h: number;
  diameter?: number;
}

export type SideElements = Record<Side, PanelElement[]>;

export interface ConfiguratorState {
  cabinet: CabinetKey;
  currentSide: Side;
  tool: ToolType;
  viewMode: ViewMode;
  zoom: number;
  selectedId: string | null;
  sideElements: SideElements;
  undoStack: SideElements[];
  redoStack: SideElements[];
  cartItems: { cabinet: CabinetKey; config: SideElements }[];
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}
