import type { ToolType } from '~/utils/types';

export function useKeyboardShortcuts() {
  const store = useConfiguratorStore();

  const handler = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    const key = e.key.toLowerCase();
    const toolMap: Record<string, ToolType> = { v: 'select', h: 'hole', r: 'rect', o: 'opening', m: 'measure' };
    if (toolMap[key]) { store.setTool(toolMap[key]); }
    else if (key === 'delete' || key === 'backspace') { store.deleteSelected(); }
    else if (e.ctrlKey && key === 'z') { e.preventDefault(); store.undo(); }
    else if (e.ctrlKey && key === 'y') { e.preventDefault(); store.redo(); }
  };

  onMounted(() => document.addEventListener('keydown', handler));
  onUnmounted(() => document.removeEventListener('keydown', handler));
}
