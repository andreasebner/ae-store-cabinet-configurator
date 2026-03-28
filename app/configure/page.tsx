'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useCartStore } from '@/store/cart-store';
import { CABINET_KEYS, SIDES, calcPrice, getPanelDimensions } from '@/lib/constants';
import type { CabinetKey, ToolType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { exportProjectJSON, parseProjectFile, saveRecent, getRecentProjects, type ProjectFile } from '@/lib/project';
import { parseDxfToSvg } from '@/lib/dxf-to-svg';
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
  Ruler, Link, Upload,
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
  const deleteSelected = useConfiguratorStore(s => s.deleteSelected);
  const addAlignment = useConfiguratorStore(s => s.addAlignment);
  const addCustomElement = useConfiguratorStore(s => s.addCustomElement);
  const startConstraintPlacement = useConfiguratorStore(s => s.startConstraintPlacement);
  const cancelConstraintPlacement = useConfiguratorStore(s => s.cancelConstraintPlacement);
  const constraintPlacement = useConfiguratorStore(s => s.constraintPlacement);
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
  const dxfInputRef = useRef<HTMLInputElement>(null);

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

  function handleImportDxf() {
    dxfInputRef.current?.click();
    setFileMenuOpen(false);
  }

  function handleDxfSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const result = parseDxfToSvg(text);
        // Scale so the shape fits within a reasonable size (max 120mm)
        const maxDim = Math.max(result.widthMM, result.heightMM);
        const scale = maxDim > 120 ? 120 / maxDim : maxDim < 10 ? 30 / maxDim : 1;
        const w = Math.round(result.widthMM * scale);
        const h = Math.round(result.heightMM * scale);
        addCustomElement(result.pathData, result.viewBox, w, h);
        showToast(`Imported DXF shape (${Math.round(result.widthMM)}×${Math.round(result.heightMM)}mm)`, '📐');
      } catch (err: any) {
        showToast(err.message || 'Failed to parse DXF file', '❌');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function closeMenus() {
    setFileMenuOpen(false);
    setAlignMenuOpen(false);
    setConstraintMenuOpen(false);
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <ConfigHeader />

      <div className="flex flex-1 min-h-0">
        {/* Left ~1/3: 3D Preview + Side Selection */}
        <div className="w-1/3 flex flex-col border-r border-slate-200 min-h-0 overflow-hidden">
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
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Toolbar — compact */}
          <div className="relative z-30 flex items-center gap-0.5 px-4 py-1.5 border-b border-slate-200 bg-white shrink-0 overflow-x-auto">
            {/* File menu */}
            <div className="relative">
              <button
                onClick={() => { setFileMenuOpen(!fileMenuOpen); setAlignMenuOpen(false); setConstraintMenuOpen(false); }}
                title="File"
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  fileMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <FilePlus className="h-3.5 w-3.5" />
                <span className="hidden">File</span>
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
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={handleImportDxf} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <Upload className="h-3.5 w-3.5" /> Import Custom Shape (.dxf)
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
                <span className="hidden">{t.label}</span>
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

            {/* Delete selected */}
            <button
              onClick={deleteSelected}
              title="Delete selected (Del)"
              className="h-7 px-2 flex items-center text-[11px] text-slate-500 hover:bg-slate-100 rounded transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Alignment dropdown — adds alignment entities */}
            <div className="relative">
              <button
                onClick={() => { setAlignMenuOpen(!alignMenuOpen); setFileMenuOpen(false); setConstraintMenuOpen(false); }}
                title="Alignment"
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  alignMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span className="hidden">Alignment</span>
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
                title="Constraint"
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  constraintPlacement ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300' :
                  constraintMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Link className="h-3.5 w-3.5" />
                <span className="hidden">{constraintPlacement ? (constraintPlacement.step === 'pick-from' ? 'Pick From…' : constraintPlacement.step === 'pick-to' ? 'Pick To…' : 'Pick Element…') : 'Constraint'}</span>
                {!constraintPlacement && <ChevronDown className={cn('h-3 w-3 transition-transform', constraintMenuOpen && 'rotate-180')} />}
              </button>
              {constraintPlacement && (
                <button
                  onClick={() => cancelConstraintPlacement()}
                  className="h-7 px-1.5 text-[11px] text-orange-600 hover:bg-orange-50 rounded transition ml-0.5"
                  title="Cancel placement"
                >
                  ✕
                </button>
              )}
              {constraintMenuOpen && !constraintPlacement && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[200px]">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                    onClick={() => { startConstraintPlacement('distance'); setConstraintMenuOpen(false); }}
                  >
                    <Link className="h-3.5 w-3.5" />
                    Add Distance Constraint
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                    onClick={() => { startConstraintPlacement('diameter'); setConstraintMenuOpen(false); }}
                  >
                    <CircleDot className="h-3.5 w-3.5" />
                    Add Diameter Constraint
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel editor */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
            <PanelEditor />
          </div>
        </div>

        {/* Right sidebar: Properties · Price */}
        <section className="w-[260px] border-l border-slate-200 bg-white flex flex-col shrink-0 overflow-hidden min-h-0">
          {/* Properties & Element List */}
          <div className="flex-1 min-h-0 overflow-hidden">
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
      <input ref={dxfInputRef} type="file" accept=".dxf" className="hidden" onChange={handleDxfSelected} />
      {(fileMenuOpen || alignMenuOpen || constraintMenuOpen) && (
        <div className="fixed inset-0 z-10" onClick={closeMenus} />
      )}
      <Toast />
      <CartDrawer />
    </div>
  );
}
