'use client';
import { useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';

export function useKeyboardShortcuts() {
  const { setTool, deleteSelected, undo, redo } = useConfiguratorStore();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'v': setTool('move'); break;
        case 'p': setTool('pan'); break;
        case 'h': setTool('hole'); break;
        case 'r': setTool('rect'); break;
        case 't': setTool('text'); break;
        case 'm': setTool('ruler'); break;
        case 'delete': case 'backspace': deleteSelected(); break;
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTool, deleteSelected, undo, redo]);
}
