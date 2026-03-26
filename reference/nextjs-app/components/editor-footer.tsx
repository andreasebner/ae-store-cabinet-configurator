'use client';

import { useConfiguratorStore } from '@/store/configurator-store';

export default function EditorFooter() {
  const price = useConfiguratorStore(s => s.price);
  const addToCart = useConfiguratorStore(s => s.addToCart);

  return (
    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
      <div>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Configured Price</div>
        <div className="text-[22px] font-bold text-gray-900 tracking-tight">€ {price.toFixed(2)}</div>
      </div>
      <button
        onClick={addToCart}
        className="px-6 py-2.5 text-sm font-semibold rounded-[10px] bg-indigo-500 text-white flex items-center gap-1.5 shadow-[0_2px_8px_rgba(99,102,241,0.25)] hover:bg-indigo-600 hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:-translate-y-px transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Add to Cart
      </button>
    </div>
  );
}
