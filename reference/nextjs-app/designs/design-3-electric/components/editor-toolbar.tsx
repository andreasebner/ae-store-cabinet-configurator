'use client';

import { useConfiguratorStore } from '@/store/configurator-store';
import { ToolType } from '@/lib/types';

const TOOLS: { key: ToolType; label: string; icon: React.ReactNode; group?: string }[] = [
  {
    key: 'select', label: 'Select (V)',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M3 2L3 12L6.5 8.5L10 12L12 10L8.5 6.5L12.5 3L3 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  },
  { key: 'hole', label: 'Round Hole (H)', group: 'Add',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  { key: 'rect', label: 'Rect Hole (R)',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
  { key: 'opening', label: 'Cable Opening (O)',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><rect x="3" y="4" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/></svg>,
  },
  { key: 'measure', label: 'Measure (M)', group: 'sep',
    icon: <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><line x1="2" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5"/><line x1="2" y1="11" x2="2" y2="15" stroke="currentColor" strokeWidth="1.5"/><line x1="14" y1="11" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5"/></svg>,
  },
];

export default function EditorToolbar() {
  const activeTool = useConfiguratorStore(s => s.activeTool);
  const setTool = useConfiguratorStore(s => s.setTool);

  return (
    <div className="flex items-center gap-0.5 px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
      {TOOLS.map((tool, i) => (
        <div key={tool.key} className="contents">
          {i === 1 && <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />}
          {tool.group === 'Add' && (
            <span className="text-[10px] mx-1 font-semibold uppercase tracking-[0.15em] font-chakra" style={{ color: 'var(--text-tertiary)' }}>
              Add
            </span>
          )}
          {tool.group === 'sep' && <div className="w-px h-5 mx-1" style={{ background: 'var(--border)' }} />}
          <button
            title={tool.label}
            onClick={() => setTool(tool.key)}
            className="w-8 h-8 rounded flex items-center justify-center transition-all"
            style={activeTool === tool.key ? {
              background: 'var(--cyan)',
              color: 'var(--navy-base)',
              boxShadow: '0 0 12px rgba(0, 229, 255, 0.35), 0 0 24px rgba(0, 229, 255, 0.1)',
            } : {
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              if (activeTool !== tool.key) {
                e.currentTarget.style.color = 'var(--cyan)';
                e.currentTarget.style.background = 'var(--cyan-subtle)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 229, 255, 0.1)';
              }
            }}
            onMouseLeave={e => {
              if (activeTool !== tool.key) {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {tool.icon}
          </button>
        </div>
      ))}
    </div>
  );
}
