'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Ruler, Shield, Zap } from 'lucide-react';
import { CABINETS, CABINET_KEYS } from '@/lib/constants';

const features: Record<string, { icon: typeof Shield; label: string }[]> = {
  compact:    [{ icon: Shield, label: 'IP65' }, { icon: Zap, label: 'ABS halogen-free' }, { icon: Ruler, label: 'IK10' }],
  standard:   [{ icon: Shield, label: 'IP65' }, { icon: Zap, label: 'ABS halogen-free' }, { icon: Ruler, label: 'Transparent door' }],
  large:      [{ icon: Shield, label: 'IP65' }, { icon: Zap, label: 'Chemical resistant' }, { icon: Ruler, label: '−35 °C to +65 °C' }],
  industrial: [{ icon: Shield, label: 'IP65' }, { icon: Zap, label: 'Dual locking' }, { icon: Ruler, label: 'Galv. mounting plate' }],
};

export function CabinetCatalog() {
  return (
    <section id="catalog" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">ARLI IP65 Enclosures</h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            Industrial-grade ABS plastic enclosures with transparent door, galvanized mounting plate, and IP65 protection.
            Suitable for indoor and outdoor use in energy, automation, solar, HVAC and more.
          </p>
        </div>

        {/* Grid of cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CABINET_KEYS.map((key, i) => {
            const cab = CABINETS[key];
            const feats = features[key] || [];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
                  {/* Visual: abstract cabinet shape */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                    <div className="relative">
                      {/* Cabinet body */}
                      <div
                        className="rounded-md border-2 border-slate-300 bg-slate-200/70 group-hover:border-brand-400 group-hover:bg-brand-50 transition-all duration-300"
                        style={{
                          width: Math.round(cab.w / 10),
                          height: Math.round(cab.h / 8),
                        }}
                      >
                        {/* Door line */}
                        <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-px bg-slate-300/60" />
                        {/* Handle dot */}
                        <div className="absolute top-1/2 right-[18%] -translate-y-1/2 w-1 h-3 rounded-full bg-slate-400 group-hover:bg-brand-400 transition" />
                      </div>
                      {/* Shadow */}
                      <div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-2 rounded-full bg-slate-200 blur-sm"
                        style={{ width: Math.round(cab.w / 12) }}
                      />
                    </div>
                    {/* Dimension label */}
                    <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-white/80 px-1.5 py-0.5 rounded">
                      {cab.w}×{cab.h}×{cab.d}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="font-semibold text-slate-900 mb-1">{cab.name}</h3>
                    <p className="text-sm text-slate-500 mb-3 flex-1">{cab.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {feats.map(f => (
                        <span key={f.label} className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <f.icon className="w-3 h-3" />
                          {f.label}
                        </span>
                      ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400">From</span>
                        <span className="ml-1 text-lg font-bold text-slate-900">€{cab.basePrice.toFixed(0)}</span>
                      </div>
                      <Link
                        href={`/configure?cabinet=${key}`}
                        className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition group/btn"
                      >
                        Configure
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
