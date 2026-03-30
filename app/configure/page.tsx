'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useConfiguratorStore } from '@/store/configurator-store';
import { useCartStore } from '@/store/cart-store';
import { CABINET_KEYS, SIDES, calcPrice, getPanelDimensions, COMPONENT_CATALOG, SHAPE_CATALOG } from '@/lib/constants';
import type { CabinetKey, ToolType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { exportProjectJSON, parseProjectFile, saveRecent, getRecentProjects, removeRecent, createProjectFile, type ProjectFile } from '@/lib/project';
import { parseDxfToSvg } from '@/lib/dxf-to-svg';
import { exportPanelDxf, importPanelDxf } from '@/lib/panel-dxf';
import { ELEMENT_DEFAULTS } from '@/lib/constants';
import ConfigHeader from '@/components/configurator/config-header';
import PanelEditor from '@/components/configurator/panel-editor';
import DetailsPanel from '@/components/configurator/details-panel';
import Toast from '@/components/configurator/toast';
import { CartDrawer } from '@/components/cart/cart-drawer';
import {
  MousePointer2, Circle, Square,
  Trash2, ShoppingCart,
  ChevronDown, ChevronRight, CircleDot, Grid3X3,
  FolderOpen, Download, FilePlus, Clock,
  Ruler, Link, Upload, Plug, Hand, Type, Shapes, Fan,
} from 'lucide-react';

const Cabinet3DScene = dynamic(() => import('@/components/configurator/cabinet-3d-scene'), { ssr: false });

const TOOLS: { key: ToolType; label: string; shortcut: string; Icon: React.ComponentType<any> }[] = [
  { key: 'move', label: 'Select', shortcut: 'V', Icon: MousePointer2 },
  { key: 'pan', label: 'Pan', shortcut: 'P', Icon: Hand },
  { key: 'hole', label: 'Hole', shortcut: 'H', Icon: Circle },
  { key: 'rect', label: 'Rect', shortcut: 'R', Icon: Square },
  { key: 'text', label: 'Text', shortcut: 'T', Icon: Type },
  { key: 'ruler', label: 'Measure', shortcut: 'M', Icon: Ruler },
];

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

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
  const addComponent = useConfiguratorStore(s => s.addComponent);
  const startConstraintPlacement = useConfiguratorStore(s => s.startConstraintPlacement);
  const cancelConstraintPlacement = useConfiguratorStore(s => s.cancelConstraintPlacement);
  const constraintPlacement = useConfiguratorStore(s => s.constraintPlacement);
  const currentElements = useConfiguratorStore(s => s.currentElements);
  const currentCabinet = useConfiguratorStore(s => s.currentCabinet);
  const zoomLevel = useConfiguratorStore(s => s.zoomLevel);
  const setZoom = useConfiguratorStore(s => s.setZoom);
  const loadProjectState = useConfiguratorStore(s => s.loadProject);
  const resetProject = useConfiguratorStore(s => s.resetProject);
  const replaceCurrentSideElements = useConfiguratorStore(s => s.replaceCurrentSideElements);
  const price = calcPrice(currentCabinet, sideElements);
  const { addItem } = useCartStore();
  const showToast = useConfiguratorStore(s => s.showToast);
  const [alignMenuOpen, setAlignMenuOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [constraintMenuOpen, setConstraintMenuOpen] = useState(false);
  const [componentMenuOpen, setComponentMenuOpen] = useState(false);
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [recentProjects, setRecentProjects] = useState<ProjectFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dxfInputRef = useRef<HTMLInputElement>(null);
  const panelDxfInputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState('Standard Design');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Tool presets — dimensions before placing
  const [holeDiameter, setHoleDiameter] = useState(ELEMENT_DEFAULTS.hole.diameter ?? 22);
  const [rectW, setRectW] = useState(ELEMENT_DEFAULTS.rect.w);
  const [rectH, setRectH] = useState(ELEMENT_DEFAULTS.rect.h);
  const [labelText, setLabelText] = useState('Label');
  const [labelFontSize, setLabelFontSize] = useState(10);

  const toolOverrides = activeTool === 'hole' ? { diameter: holeDiameter }
    : activeTool === 'rect' ? { w: rectW, h: rectH }
    : activeTool === 'text' ? { text: labelText, fontSize: labelFontSize }
    : undefined;

  useKeyboardShortcuts();

  useEffect(() => {
    const cab = searchParams.get('cabinet');
    if (cab && CABINET_KEYS.includes(cab as CabinetKey)) {
      setCabinet(cab as CabinetKey);
    }
  }, [searchParams, setCabinet]);

  useEffect(() => {
    const recent = getRecentProjects();
    const hasStandard = recent.some(p => p.name === 'Standard Design');
    if (!hasStandard) {
      const std = createProjectFile('Standard Design', currentCabinet, sideElements);
      saveRecent(std);
      setRecentProjects(getRecentProjects());
    } else {
      setRecentProjects(recent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddToCart() {
    addItem(currentCabinet, sideElements, price);
    let n = 0;
    SIDES.forEach(s => { n += sideElements[s].length; });
    showToast(`Cabinet added to cart (${n} cutout${n !== 1 ? 's' : ''})`, '🛒');
  }

  function handleNewDesign() {
    setNameInput('');
    setShowNameDialog(true);
    setFileMenuOpen(false);
  }

  function handleNameConfirm() {
    const name = nameInput.trim() || 'Untitled Design';
    resetProject();
    setProjectName(name);
    setShowNameDialog(false);
    showToast(`New design "${name}" started`, '📄');
  }

  function handleRemoveRecent(e: React.MouseEvent, createdAt: string) {
    e.stopPropagation();
    removeRecent(createdAt);
    setRecentProjects(getRecentProjects());
  }

  function handleExportProject() {
    const json = exportProjectJSON(projectName, currentCabinet, sideElements);
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
        setProjectName(project.name);
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
    setProjectName(project.name);
    showToast(`Loaded: ${project.name}`, '📂');
    setFileMenuOpen(false);
  }

  function handleImportDxf() {
    dxfInputRef.current?.click();
    setFileMenuOpen(false);
  }

  function handleExportPanelDxf() {
    const { pw, ph } = getPanelDimensions(currentCabinet, currentSide);
    const els = currentElements();
    const dxfContent = exportPanelDxf(els, pw, ph);
    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panel-${currentSide}-${Date.now()}.dxf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Panel exported as DXF (${currentSide})`, '📐');
    setFileMenuOpen(false);
  }

  function handleImportPanelDxf() {
    panelDxfInputRef.current?.click();
    setFileMenuOpen(false);
  }

  function handlePanelDxfSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const result = importPanelDxf(text);
        replaceCurrentSideElements(result.elements);
        showToast(`Imported ${result.elements.length} element${result.elements.length !== 1 ? 's' : ''} from DXF`, '📐');
      } catch (err: any) {
        showToast(err.message || 'Failed to parse DXF panel file', '❌');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
    setComponentMenuOpen(false);
    setShapeMenuOpen(false);
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
          <div className="relative z-30 flex items-center gap-0.5 px-4 py-1.5 border-b border-slate-200 bg-white shrink-0">
            {/* File menu */}
            <div className="relative">
              <button
                onClick={() => { const open = !fileMenuOpen; closeMenus(); setFileMenuOpen(open); }}
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
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
                  <button onClick={handleNewDesign} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <FilePlus className="h-3.5 w-3.5" /> New Design
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
                    <Upload className="h-3.5 w-3.5" /> Custom Shape (.dxf)
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button onClick={handleExportPanelDxf} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <Download className="h-3.5 w-3.5" /> Export Panel (.dxf)
                  </button>
                  <button onClick={handleImportPanelDxf} className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    <Upload className="h-3.5 w-3.5" /> Import Panel (.dxf)
                  </button>
                  {recentProjects.length > 0 && (
                    <>
                      <div className="h-px bg-slate-100 my-1" />
                      <div className="px-3 py-1 text-[10px] text-slate-400 font-medium uppercase tracking-wider">Recent</div>
                      {recentProjects.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex items-center hover:bg-slate-50 transition group">
                          <button onClick={() => handleLoadRecent(p)} className="flex-1 flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 transition min-w-0">
                            <Clock className="h-3 w-3 shrink-0" /> <span className="truncate">{p.name}</span>
                          </button>
                          <button onClick={(e) => handleRemoveRecent(e, p.createdAt)} className="px-2 py-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition" title="Remove">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
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

            {/* Alignment dropdown — adds alignment entities */}
            <div className="relative">
              <button
                onClick={() => { const open = !alignMenuOpen; closeMenus(); setAlignMenuOpen(open); }}
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
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
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
                onClick={() => { const open = !constraintMenuOpen; closeMenus(); setConstraintMenuOpen(open); }}
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
              {constraintMenuOpen && !constraintPlacement && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[200px]">
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

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Components dropdown */}
            <div className="relative">
              <button
                onClick={() => { const open = !componentMenuOpen; closeMenus(); setComponentMenuOpen(open); }}
                title="Components"
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  componentMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Plug className="h-3.5 w-3.5" />
                <span className="hidden">Components</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', componentMenuOpen && 'rotate-180')} />
              </button>
              {componentMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[220px] max-h-[420px] overflow-y-auto">
                  {['M8', 'M12', 'Power'].map(cat => {
                    const items = COMPONENT_CATALOG.filter(c => c.category === cat);
                    if (items.length === 0) return null;
                    const isExpanded = expandedCategory === cat;
                    return (
                      <div key={cat}>
                        <button
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition font-medium"
                          onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                          <span>{cat}</span>
                          <span className="ml-auto text-[10px] text-slate-400">{items.length}</span>
                        </button>
                        {isExpanded && items.map(comp => (
                          <button
                            key={comp.id}
                            className="w-full flex items-center gap-2 pl-8 pr-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                            onClick={() => { addComponent(comp.id); setComponentMenuOpen(false); setExpandedCategory(null); showToast(`Added ${comp.label}`, '🔌'); }}
                          >
                            {comp.shape === 'circle' ? <Circle className="h-3 w-3 shrink-0" /> : <Square className="h-3 w-3 shrink-0" />}
                            <span className="truncate">{comp.label}</span>
                            <span className="ml-auto text-[10px] text-slate-400 shrink-0">€{comp.price.toFixed(2)}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            {/* Shapes dropdown */}
            <div className="relative">
              <button
                onClick={() => { const open = !shapeMenuOpen; closeMenus(); setShapeMenuOpen(open); }}
                title="Shapes"
                className={cn(
                  'h-7 px-2 flex items-center gap-1 text-[11px] rounded transition-colors',
                  shapeMenuOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                <Shapes className="h-3.5 w-3.5" />
                <span className="hidden">Shapes</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', shapeMenuOpen && 'rotate-180')} />
              </button>
              {shapeMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[200px]">
                  {SHAPE_CATALOG.map(shape => (
                    <button
                      key={shape.id}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                      onClick={() => {
                        addCustomElement(shape.pathData, shape.viewBox, shape.w, shape.h);
                        setShapeMenuOpen(false);
                        showToast(`Added ${shape.label}`, '💨');
                      }}
                    >
                      <Fan className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{shape.label}</span>
                      <span className="ml-auto text-[10px] text-slate-400 shrink-0">€{shape.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sub-toolbar — tool options + zoom + delete */}
          <div className="relative z-20 flex items-center gap-2 px-4 py-1 border-b border-slate-200 bg-slate-50 shrink-0">
            {constraintPlacement ? (
              <>
                <Link className="h-3.5 w-3.5 text-orange-500" />
                <span className="text-[10px] text-orange-600 font-medium">
                  {constraintPlacement.type === 'diameter' ? 'Diameter' : 'Distance'}:
                </span>
                <span className="text-[10px] text-slate-500">
                  {constraintPlacement.step === 'pick-from' ? 'Click element or border as start reference'
                    : constraintPlacement.step === 'pick-to' ? 'Click target element'
                    : 'Click a circular element'}
                </span>
                <button
                  onClick={() => cancelConstraintPlacement()}
                  className="h-6 px-2 text-[11px] text-orange-600 hover:bg-orange-100 border border-orange-200 rounded transition"
                >
                  Cancel <span className="text-[9px] text-orange-400 ml-0.5">Esc</span>
                </button>
              </>
            ) : activeTool === 'hole' ? (
              <>
                <span className="text-[10px] text-slate-400">Diameter</span>
                <input
                  type="number" min={5} step={1} value={holeDiameter}
                  onChange={e => { const v = Number(e.target.value); if (!isNaN(v) && v >= 5) setHoleDiameter(v); }}
                  className="w-16 h-6 text-[11px] px-1.5 border border-slate-200 rounded bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </>
            ) : activeTool === 'rect' ? (
              <>
                <span className="text-[10px] text-slate-400">W</span>
                <input
                  type="number" min={5} step={1} value={rectW}
                  onChange={e => { const v = Number(e.target.value); if (!isNaN(v) && v >= 5) setRectW(v); }}
                  className="w-14 h-6 text-[11px] px-1.5 border border-slate-200 rounded bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">×</span>
                <span className="text-[10px] text-slate-400">H</span>
                <input
                  type="number" min={5} step={1} value={rectH}
                  onChange={e => { const v = Number(e.target.value); if (!isNaN(v) && v >= 5) setRectH(v); }}
                  className="w-14 h-6 text-[11px] px-1.5 border border-slate-200 rounded bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </>
            ) : activeTool === 'text' ? (
              <>
                <span className="text-[10px] text-slate-400">Text</span>
                <input
                  type="text" value={labelText}
                  onChange={e => setLabelText(e.target.value)}
                  className="w-28 h-6 text-[11px] px-1.5 border border-slate-200 rounded bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                  placeholder="Label text…"
                />
                <span className="text-[10px] text-slate-400">Size</span>
                <input
                  type="number" min={5} max={40} step={1} value={labelFontSize}
                  onChange={e => { const v = Number(e.target.value); if (!isNaN(v) && v >= 5 && v <= 40) setLabelFontSize(v); }}
                  className="w-12 h-6 text-[11px] px-1.5 border border-slate-200 rounded bg-white focus:ring-1 focus:ring-brand-500 outline-none"
                />
                <span className="text-[10px] text-slate-400">mm</span>
              </>
            ) : null}

            <div className="flex-1" />

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
          </div>

          {/* Panel editor */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
            <PanelEditor toolOverrides={toolOverrides} />
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
      <input ref={panelDxfInputRef} type="file" accept=".dxf" className="hidden" onChange={handlePanelDxfSelected} />
      {(fileMenuOpen || alignMenuOpen || constraintMenuOpen || componentMenuOpen || shapeMenuOpen) && (
        <div className="fixed inset-0 z-10" onClick={closeMenus} />
      )}
      <Toast />
      <CartDrawer />

      {/* Name dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowNameDialog(false)}>
          <div className="bg-white rounded-lg shadow-xl p-5 w-80" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">New Design</h3>
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNameConfirm(); if (e.key === 'Escape') setShowNameDialog(false); }}
              placeholder="Enter design name…"
              className="w-full h-8 text-sm px-3 border border-slate-300 rounded focus:ring-2 focus:ring-brand-500 outline-none mb-3"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNameDialog(false)} className="h-8 px-3 text-xs text-slate-500 hover:bg-slate-100 rounded transition">Cancel</button>
              <button onClick={handleNameConfirm} className="h-8 px-4 text-xs font-medium bg-brand-600 text-white rounded hover:bg-brand-700 transition">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
