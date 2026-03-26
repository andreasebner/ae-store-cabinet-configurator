'use client';

import { useConfiguratorStore } from '@/store/configurator-store';

export default function EditorFooter() {
  const price = useConfiguratorStore(s => s.price);
  const addToCart = useConfiguratorStore(s => s.addToCart);

  return (
    <div
      className="px-4 py-3 flex items-center justify-between"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--navy-surface) 0%, var(--navy-base) 100%)',
      }}
    >
      <div>
        <div className="text-[10px] uppercase tracking-[0.15em] font-semibold font-chakra" style={{ color: 'var(--text-tertiary)' }}>
          Configured Price
        </div>
        <div className="text-[22px] font-bold tracking-tight font-chakra" style={{ color: 'var(--text-primary)' }}>
          &euro; {price.toFixed(2)}
        </div>
      </div>
      <button
        onClick={addToCart}
        className="px-6 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition-all font-chakra uppercase tracking-wider"
        style={{
          background: 'var(--cyan)',
          color: 'var(--navy-base)',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          boxShadow: '0 0 12px rgba(0, 229, 255, 0.3), 0 0 30px rgba(0, 229, 255, 0.1)',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.5), 0 0 50px rgba(0, 229, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.3), 0 0 30px rgba(0, 229, 255, 0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="14" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M1 1H3L5 11H15L17 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Add to Cart
      </button>
    </div>
  );
}
