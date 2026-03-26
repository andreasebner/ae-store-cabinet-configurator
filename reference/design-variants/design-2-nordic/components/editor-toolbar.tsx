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
    <div className="flex items-center gap-1 px-5 py-2.5 border-b border-[#EDE8E3]">
      {TOOLS.map((tool, i) => (
        <div key={tool.key} className="contents">
          {i === 1 && <div className="w-px h-5 bg-[#EDE8E3] mx-1.5" />}
          {tool.group === 'Add' && (
            <span className="text-[10px] text-[#C4BCB5] mx-1.5 font-semibold uppercase tracking-wider font-outfit">Add</span>
          )}
          {tool.group === 'sep' && <div className="w-px h-5 bg-[#EDE8E3] mx-1.5" />}
          <button
            title={tool.label}
            onClick={() => setTool(tool.key)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
              ${activeTool === tool.key
                ? 'bg-[#C4644A] text-white shadow-[0_2px_8px_rgba(196,100,74,0.2)]'
                : 'text-[#8A817A] hover:bg-[#F5F2EE] hover:text-[#5C5550]'
              }`}
          >
            {tool.icon}
          </button>
        </div>
      ))}
    </div>
  );
}
