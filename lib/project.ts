import type { CabinetKey, SideElements, PanelElement, Side } from './types';

export interface ProjectFile {
  formatVersion: '1.0';
  name: string;
  createdAt: string;
  updatedAt: string;
  cabinetKey: CabinetKey;
  sideElements: SideElements;
}

const STORAGE_KEY = 'cabinet-configurator-recent';
const MAX_RECENT = 10;

const VALID_SIDES: Side[] = ['front', 'back', 'left', 'right', 'top', 'bottom'];
const VALID_CABINET_KEYS: CabinetKey[] = ['compact', 'standard', 'large', 'industrial'];
const VALID_ELEMENT_TYPES = ['hole', 'rect', 'custom', 'text'];

export function createProjectFile(
  name: string,
  cabinetKey: CabinetKey,
  sideElements: SideElements,
): ProjectFile {
  const now = new Date().toISOString();
  return {
    formatVersion: '1.0',
    name,
    createdAt: now,
    updatedAt: now,
    cabinetKey,
    sideElements,
  };
}

export function exportProjectJSON(
  name: string,
  cabinetKey: CabinetKey,
  sideElements: SideElements,
): string {
  return JSON.stringify(createProjectFile(name, cabinetKey, sideElements), null, 2);
}

function isValidElement(el: unknown): el is PanelElement {
  if (typeof el !== 'object' || el === null) return false;
  const o = el as Record<string, unknown>;
  return (
    typeof o.id === 'number' &&
    typeof o.type === 'string' && VALID_ELEMENT_TYPES.includes(o.type) &&
    typeof o.x === 'number' &&
    typeof o.y === 'number' &&
    typeof o.w === 'number' &&
    typeof o.h === 'number'
  );
}

export function parseProjectFile(json: string): ProjectFile {
  const data = JSON.parse(json);
  if (data.formatVersion !== '1.0') throw new Error('Unsupported format version');
  if (typeof data.name !== 'string') throw new Error('Missing project name');
  if (!VALID_CABINET_KEYS.includes(data.cabinetKey)) throw new Error('Invalid cabinet key');
  if (typeof data.sideElements !== 'object' || data.sideElements === null) throw new Error('Missing side elements');

  for (const side of VALID_SIDES) {
    if (!Array.isArray(data.sideElements[side])) throw new Error(`Missing side: ${side}`);
    for (const el of data.sideElements[side]) {
      if (!isValidElement(el)) throw new Error(`Invalid element on side ${side}`);
    }
  }

  return data as ProjectFile;
}

export function saveRecent(project: ProjectFile): void {
  try {
    const existing = getRecentProjects();
    const updated = [
      { ...project, updatedAt: new Date().toISOString() },
      ...existing.filter(p => p.createdAt !== project.createdAt),
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable
  }
}

export function getRecentProjects(): ProjectFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p: Record<string, unknown>) =>
      p.formatVersion === '1.0' &&
      typeof p.name === 'string' &&
      VALID_CABINET_KEYS.includes(p.cabinetKey as CabinetKey)
    );
  } catch {
    return [];
  }
}

export function removeRecent(createdAt: string): void {
  try {
    const existing = getRecentProjects();
    const updated = existing.filter(p => p.createdAt !== createdAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable
  }
}
