'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useCartStore } from '@/store/cart-store';
import { CABINET_KEYS, SIDES, calcPrice, getPanelDimensions } from '@/lib/constants';
import type { CabinetKey, ToolType, BorderRef } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { exportProjectJSON, parseProjectFile, saveRecent, getRecentProjects, type ProjectFile } from '@/lib/project';
import ConfigHeader from '@/components/configurator/config-header';
import PanelEditor from '@/components/configurator/panel-editor';
import DetailsPanel from '@/components/configurator/details-panel';
import Toast from '@/components/configurator/toast';
import { CartDrawer } from '@/components/cart/cart-drawer';
import {
  MousePointer2, Circle, Square, RectangleHorizontal,
  Trash2, ShoppingCart,
  ChevronDown, CircleDot, Grid3X3,
  FolderOpen, Download, FilePlus, Clock,
  Ruler, Link,
} from 'lucide-react';

const Cabinet3DScene = dynamic(() => import('@/components/configurator/cabinet-3d-scene'), { ssr: false });

const TOOLS: { key: ToolType; label: string; shortcut: string; Icon: React.ComponentType<any> }[] = [
  { key: 'move', label: 'Select', shortcut: 'V', Icon: MousePointer2 },
  { key: 'hole', label: 'Hole', shortcut: 'H', Icon: Circle },
  { key: 'rect', label: 'Rect', shortcut: 'R', Icon: Square },
  { key: 'opening', label: 'Opening', shortcut: 'O', Icon: RectangleHorizontal },
  { key: 'ruler', label: 'Measure', shortcut: 'M', Icon: Ruler },
];

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function ConfigurePage() {
  const searchParams = useSearchParams();
  const setCabinet = useConfiguratorStore(s => s.setCabinet);
  const currentSide = useConfiguratorStore(s => s.currentSide);
  const setSide = useConfiguratorStore(s => s.setSide);
  const sideElements = useConfiguratorStore(s => s.sideElements);
  const activeTool = useConfiguratorStore(s => s.activeTool);
  const setTool = useConfiguratorStore(s => s.setTool);
  const clearCurrentSide = useConfiguratorStore(s => s.clearCurrentSide);
  const deleteSelectedMulti = useConfiguratorStore(s => s.deleteSelectedMulti);
  const selectedElIds = useConfiguratorStore(s => s.selectedElIds);
  const addAlignment = useConfiguratorStore(s => s.addAlignment);
  const addConstraint = useConfiguratorStore(s => s.addConstraint);
  const selectedElId = useConfiguratorStore(s => s.selectedElId);
  const currentElements = useConfiguratorStore(s => s.currentElements);
  const currentCabinet = useConfiguratorStore(s => s.currentCabinet);
  const zoomLevel = useConfiguratorStore(s => s.zoomLevel);
  const setZoom = useConfiguratorStore(s => s.setZoom);
  const loadProjectState = useConfiguratorStore(s => s.loadProject);
  const resetProject = useConfiguratorStore(s => s.resetProject);
  const price = calcPrice(currentCabinet, sideElements);
  const { addItem } = useCartStore();
  const showToast = useConfiguratorStore(s => s.showToast);
  const [alignMenuOpen, setAlignMenuOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [constraintMenuOpen, setConstraintMenuOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState<ProjectFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    const cab = searchParams.get('cabinet');
    if (cab && CABINET_KEYS.includes(cab as CabinetKey)) {
      setCabinet(cab as CabinetKey);
    }
  }, [searchParams, setCabinet]);

  useEffect(() => {
    setRecentProjects(getRecentProjects());
  }, []);

  function handleAddToCart() {
    addItem(currentCabinet, sideElements, price);
    let n = 0;
    SIDES.forEach(s => { n += sideElements[s].length; });
    showToast(`Cabinet added to cart (${n} cutout${n !== 1 ? 's' : ''})`, '🛒');
  }

  function handleNewProject() {
    resetProject();
    showToast('New project started', '📄');
    setFileMenuOpen(false);
  }

  function handleExportProject() {
    const json = exportProjectJSON('Cabinet Project', currentCabinet, sideElements);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cabinet-project-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const project = JSON.parse(json) as ProjectFile;
    saveRecent(project);
    setRecentProjects(getRecentProjects());
    showToast('Project exported', '📦');
    setFileMenuOpen(false);
  }

  function handleOpenProject() {
    fileInputRef.current?.click();
    setFileMenuOpen(false);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const project = parseProjectFile(ev.target?.result as string);
        loadProjectState(project.cabinetKey, project.sideElements);
        saveRecent(project);
        setRecentProjects(getRecentProjects());
        showToast(`Loaded: ${project.name}`, '📂');
      } catch {
        showToast('Invalid project file', '❌');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleLoadRecent(project: ProjectFile) {
    loadProjectState(project.cabinetKey, project.sideElements);
    showToast(`Loaded: ${project.name}`, '📂');
    setFileMenuOpen(false);
  }

  function closeMenus() {
    setFileMenuOpen(false);
    setAlignMenuOpen(false);
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <ConfigHeader />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left ~1/3: 3D Preview + Side Selection */}
        <div className="w-1/3 flex flex-col border-r border-slate-200 min-h-0">
          <section className="flex-1 bg-slate-50 min-h-0 relative">
            <Cabinet3DScene />
          </section>

          {/* Side pills below 3D preview */}
          <div className="px-4 py-2 bg-white border-t border-slate-200 shrink-0">
            <div className="flex gap-1 justify-center">
              {SIDES.map(side => {
                const count = sideElements[side]?.length || 0;
                const active = currentSide === side;
                return (
                  <button
                    key={side}
                    onClick={() => setSide(side)}
                    className={cn(
                      'h-7 px-2.5 text-[11px] rounded capitalize transition-colors',
                      active
                        ? 'bg-brand-600 text-white font-medium'
                        : count > 0
                          ? 'text-slate-700 hover:bg-slate-100 font-medium'
                          : 'text-slate-400 hover:bg-slate-50'
                    )}
                  >
                    {side}
                    {count > 0 && !active && (
                      <span className="ml-0.5 text-[9px] text-brand-500">·{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Middle: 2D Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Toolbar — compact */}
          <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-slate-200 bg-white shrink-0">
            {/* File menu */}
            <div className="relative">
              <button
                onClick={() => { setFileMenuOpen(!fileMenuOpen); setAlignMenuOpen(false); setConstraintMenuOpen(false); }}
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  fileMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <FilePlus className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">File</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', fileMenuOpen && 'rotate-180')} />
              </button>
              {fileMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[180px]">
                  <button onClick={handleNewProject} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <FilePlus className="h-3.5 w-3.5" /> New Project
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={handleOpenProject} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <FolderOpen className="h-3.5 w-3.5" /> Open Project…
                  </button>
                  <button onClick={handleExportProject} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <Download className="h-3.5 w-3.5" /> Export Project
                  </button>
                  {recentProjects.length > 0 && (
                    <>
                      <div className="h-px bg-slate-100 my-1" />
                      <div className="px-3 py-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Recent</div>
                      {recentProjects.slice(0, 5).map((p, i) => (
                        <button key={i} onClick={() => handleLoadRecent(p)} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                          <Clock className="h-3 w-3 shrink-0" /> <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {TOOLS.map(t => (
              <button
                key={t.key}
                onClick={() => setTool(t.key)}
                title={`${t.label} (${t.shortcut})`}
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  activeTool === t.key
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <t.Icon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            ))}

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Zoom */}
            <select
              value={String(zoomLevel)}
              onChange={e => setZoom(Number(e.target.value))}
              className="h-7 text-[11px] border border-slate-200 rounded px-1.5 bg-white focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {ZOOM_LEVELS.map(z => (
                <option key={z} value={String(z)}>{Math.round(z * 100)}%</option>
              ))}
            </select>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Delete: context-aware */}
            {selectedElIds.size > 1 ? (
              <button
                onClick={deleteSelectedMulti}
                className="h-7 px-2 flex items-center gap-1 text-[11px] text-red-500 hover:bg-red-50 rounded transition"
              >
                <Trash2 className="h-3 w-3" />
                Delete {selectedElIds.size}
              </button>
            ) : (
              <button
                onClick={clearCurrentSide}
                className="h-7 px-2 flex items-center gap-1 text-[11px] text-red-500 hover:bg-red-50 rounded transition"
              >
                <Trash2 className="h-3 w-3" />
                Clear All
              </button>
            )}

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Alignment dropdown — adds alignment entities */}
            <div className="relative">
              <button
                onClick={() => { setAlignMenuOpen(!alignMenuOpen); setFileMenuOpen(false); setConstraintMenuOpen(false); }}
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  alignMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Alignment</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', alignMenuOpen && 'rotate-180')} />
              </button>
              {alignMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[180px]">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                    onClick={() => {
                      const { pw, ph } = getPanelDimensions(currentCabinet, useConfiguratorStore.getState().currentSide);
                      addAlignment('circular', pw, ph);
                      setAlignMenuOpen(false);
                    }}
                  >
                    <CircleDot className="h-3.5 w-3.5" />
                    Add Circular Alignment
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                    onClick={() => {
                      const { pw, ph } = getPanelDimensions(currentCabinet, useConfiguratorStore.getState().currentSide);
                      addAlignment('rectangular', pw, ph);
                      setAlignMenuOpen(false);
                    }}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                    Add Rectangular Alignment
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Constraint dropdown */}
            <div className="relative">
              <button
                onClick={() => { setConstraintMenuOpen(!constraintMenuOpen); setFileMenuOpen(false); setAlignMenuOpen(false); }}
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  constraintMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Link className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Constraint</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', constraintMenuOpen && 'rotate-180')} />
              </button>
              {constraintMenuOpen && (() => {
                const { pw, ph } = getPanelDimensions(currentCabinet, useConfiguratorStore.getState().currentSide);
                const els = currentElements();
                const selEl = selectedElId !== null ? els.find(e => e.id === selectedElId) : null;
                const canAdd = selEl !== null;
                return (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[200px]">
                    {!canAdd && (
                      <p className="px-3 py-1.5 text-[11px] text-slate-400">Select an element first</p>
                    )}
                    {canAdd && (
                      <>
                        <p className="px-3 py-1 text-[10px] text-slate-400 uppercase tracking-wider">Distance from border</p>
                        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                          onClick={() => { addConstraint('border-left', selEl!.id, 'x', selEl!.x); setConstraintMenuOpen(false); }}>
                          ← Left Border
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                          onClick={() => { addConstraint('border-right', selEl!.id, 'x', pw - selEl!.x - selEl!.w); setConstraintMenuOpen(false); }}>
                          → Right Border
                        </button>
                        <button className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                          onClick={() => { addConstraint('border-bottom', selEl!.id, 'y', ph - selEl!.y - selEl!.h); setConstraintMenuOpen(false); }}>
                          ↓ Bottom Border
                        </button>
                        {els.filter(e => e.id !== selEl!.id).length > 0 && (
                          <>
                            <div className="h-px bg-slate-100 my-1" />
                            <p className="px-3 py-1 text-[10px] text-slate-400 uppercase tracking-wider">Distance to element</p>
                            {els.filter(e => e.id !== selEl!.id).map(other => {
                              const dx = other.x - (selEl!.x + selEl!.w);
                              const dy = other.y - (selEl!.y + selEl!.h);
                              const axis: 'x' | 'y' = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
                              const dist = axis === 'x' ? Math.abs(dx) : Math.abs(dy);
                              return (
                                <button key={other.id}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                                  onClick={() => {
                                    if (axis === 'x') {
                                      const from = selEl!.x < other.x ? selEl!.id : other.id;
                                      const to = selEl!.x < other.x ? other.id : selEl!.id;
                                      const fromEl = els.find(e => e.id === from)!;
                                      const toEl = els.find(e => e.id === to)!;
                                      addConstraint(from, to, 'x', toEl.x - (fromEl.x + fromEl.w));
                                    } else {
                                      const from = selEl!.y < other.y ? selEl!.id : other.id;
                                      const to = selEl!.y < other.y ? other.id : selEl!.id;
                                      const fromEl = els.find(e => e.id === from)!;
                                      const toEl = els.find(e => e.id === to)!;
                                      addConstraint(from, to, 'y', toEl.y - (fromEl.y + fromEl.h));
                                    }
                                    setConstraintMenuOpen(false);
                                  }}>
                                  <span className="capitalize">{other.type}</span>
                                  <span className="ml-auto font-mono text-[10px] text-slate-400">{axis} {Math.round(dist)}mm</span>
                                </button>
                              );
                            })}
                          </>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Panel editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <PanelEditor />
          </div>
        </div>

        {/* Right sidebar: Properties · Price */}
        <section className="w-[260px] border-l border-slate-200 bg-white flex flex-col shrink-0">
          {/* Properties & Element List */}
          <div className="flex-1 overflow-auto min-h-0">
            <DetailsPanel />
          </div>

          {/* Price + Add to Cart */}
          <div className="px-3 py-2.5 border-t border-slate-200 bg-white shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-slate-400">Configured Price</div>
              <div className="text-sm font-bold text-slate-800">€{price.toFixed(2)}</div>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full h-8 flex items-center justify-center gap-1.5 text-xs font-medium bg-brand-600 text-white rounded hover:bg-brand-700 transition"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          </div>
        </section>
      </div>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelected} />
      {(fileMenuOpen || alignMenuOpen) && (
        <div className="fixed inset-0 z-10" onClick={closeMenus} />
      )}
      <Toast />
      <CartDrawer />
    </div>
  );
}
