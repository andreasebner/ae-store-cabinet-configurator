'use client';

import { useConfiguratorStore } from '@/store/configurator-store';

export default function EditorFooter() {
  const price = useConfiguratorStore(s => s.price);
  const addToCart = useConfiguratorStore(s => s.addToCart);

  return (
    <div className="px-5 py-4 border-t border-[#EDE8E3] flex items-center justify-between bg-white rounded-b-2xl">
      <div>
        <div className="text-[10px] text-[#A69E97] uppercase tracking-wider font-semibold font-outfit">Configured Price</div>
        <div className="text-[22px] font-bold text-[#3D3532] tracking-tight font-outfit">&euro; {price.toFixed(2)}</div>
      </div>
      <button
        onClick={addToCart}
        className="px-7 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#C4644A] to-[#A8523B] text-white flex items-center gap-2 shadow-[0_4px_16px_rgba(196,100,74,0.3)] hover:shadow-[0_6px_24px_rgba(196,100,74,0.4)] hover:-translate-y-0.5 transition-all"
      >
        <svg className="w-4 h-4" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Add to Cart
      </button>
    </div>
  );
}
