import { useConfiguratorStore } from '~/stores/configurator';

export function useKeyboardShortcuts() {
  const store = useConfiguratorStore();

  function handler(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z') { e.preventDefault(); store.undo(); }
      if (e.key === 'y') { e.preventDefault(); store.redo(); }
      return;
    }
    switch (e.key.toLowerCase()) {
      case 'v': store.setTool('hole'); break;
      case 'h': store.setTool('rect'); break;
      case 'r': store.setTool('rect'); break;
      case 'o': store.setTool('opening'); break;
      case 'm': store.setTool('move'); break;
      case 'delete': case 'backspace': store.deleteSelected(); break;
    }
  }

  onMounted(() => window.addEventListener('keydown', handler));
  onUnmounted(() => window.removeEventListener('keydown', handler));
}
