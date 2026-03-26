'use client';

import { useConfiguratorStore } from '@/lib/configurator-store';

export function PropertiesPanel() {
  const { selectedElId, sideElements, currentSide, updateElementProp, deleteElement } =
    useConfiguratorStore();

  const el = selectedElId !== null
    ? sideElements[currentSide].find(e => e.id === selectedElId) ?? null
    : null;

  const typeColor = el?.type === 'hole' ? 'badge-primary' : el?.type === 'rect' ? 'badge-accent' : 'badge-warning';
  const typeIcon = el?.type === 'hole' ? '○' : el?.type === 'rect' ? '□' : '▢';

  return (
    <div className="p-3 min-h-[180px]">
      <div className="text-xs uppercase tracking-wider text-base-content/50 mb-2">Properties</div>

      {el ? (
        <>
          <div className={`badge ${typeColor} badge-sm gap-1 mb-3 capitalize`}>
            {typeIcon} {el.type}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="form-control">
              <div className="label py-0"><span className="label-text text-xs">X (mm)</span></div>
              <input type="number" className="input input-bordered input-sm" value={el.x}
                onChange={e => updateElementProp(el.id, 'x', +e.target.value)} />
            </label>
            <label className="form-control">
              <div className="label py-0"><span className="label-text text-xs">Y (mm)</span></div>
              <input type="number" className="input input-bordered input-sm" value={el.y}
                onChange={e => updateElementProp(el.id, 'y', +e.target.value)} />
            </label>

            {el.type === 'hole' ? (
              <label className="form-control col-span-2">
                <div className="label py-0"><span className="label-text text-xs">Diameter (mm)</span></div>
                <input type="number" className="input input-bordered input-sm" value={el.diameter}
                  onChange={e => updateElementProp(el.id, 'diameter', +e.target.value)} />
              </label>
            ) : (
              <>
                <label className="form-control">
                  <div className="label py-0"><span className="label-text text-xs">Width (mm)</span></div>
                  <input type="number" className="input input-bordered input-sm" value={el.w}
                    onChange={e => updateElementProp(el.id, 'w', +e.target.value)} />
                </label>
                <label className="form-control">
                  <div className="label py-0"><span className="label-text text-xs">Height (mm)</span></div>
                  <input type="number" className="input input-bordered input-sm" value={el.h}
                    onChange={e => updateElementProp(el.id, 'h', +e.target.value)} />
                </label>
              </>
            )}
          </div>

          <button className="btn btn-error btn-sm btn-block mt-3 gap-1" onClick={() => deleteElement(el.id)}>
            🗑 Delete Element
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-24 text-base-content/30">
          <span className="text-3xl mb-1">👆</span>
          <span className="text-xs">Select an element to edit</span>
        </div>
      )}
    </div>
  );
}
