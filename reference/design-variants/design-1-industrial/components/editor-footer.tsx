'use client';

import { useConfiguratorStore } from '@/store/configurator-store';

export default function EditorFooter() {
  const price = useConfiguratorStore(s => s.price);
  const addToCart = useConfiguratorStore(s => s.addToCart);

  return (
    <div className="px-4 py-3 border-t-2 border-[#3A3F4A] flex items-center justify-between bg-[#1A1D23]">
      <div>
        <div className="text-[9px] text-[#4B5563] uppercase tracking-[0.15em] font-bold font-mono">Configured Price</div>
        <div className="text-[22px] font-bold text-[#E8EAED] tracking-tight font-mono tabular-nums">
          &euro; {price.toFixed(2)}
        </div>
      </div>
      <button
        onClick={addToCart}
        className="px-6 py-2.5 text-sm font-bold rounded-sm bg-[#FF6B2C] text-white flex items-center gap-2 shadow-[0_0_16px_rgba(255,107,44,0.3)] hover:bg-[#E85A1E] hover:shadow-[0_0_24px_rgba(255,107,44,0.45)] hover:-translate-y-px transition-all uppercase tracking-wider border border-[#FF6B2C]"
      >
        <svg className="w-4 h-4" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Add to Cart
      </button>
    </div>
  );
}
