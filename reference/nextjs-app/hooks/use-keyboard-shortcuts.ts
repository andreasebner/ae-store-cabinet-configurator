'use client';

import { useEffect } from 'react';
import { useConfiguratorStore } from '@/store/configurator-store';
import { ToolType } from '@/lib/types';

export function useKeyboardShortcuts() {
  const setTool = useConfiguratorStore(s => s.setTool);
  const deleteSelected = useConfiguratorStore(s => s.deleteSelected);
  const undo = useConfiguratorStore(s => s.undo);
  const redo = useConfiguratorStore(s => s.redo);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      const toolMap: Record<string, ToolType> = {
        v: 'select', h: 'hole', r: 'rect', o: 'opening', m: 'measure',
      };

      if (toolMap[key]) {
        setTool(toolMap[key]);
      } else if (key === 'delete' || key === 'backspace') {
        deleteSelected();
      } else if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setTool, deleteSelected, undo, redo]);
}
