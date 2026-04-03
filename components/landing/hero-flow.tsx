'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Box, Settings, ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { CABINETS, CABINET_KEYS } from '@/lib/constants';
import type { CabinetKey } from '@/lib/types';
import { useState } from 'react';

const STEPS = [
  {
    icon: Box,
    num: '01',
    title: 'Select Cabinet',
    desc: 'Choose from our ARLI IP65 ABS enclosures — from compact wall-mount to full-size industrial cabinets with transparent door.',
    color: 'text-brand-600',
    bg: 'bg-brand-50',
  },
  {
    icon: Settings,
    num: '02',
    title: 'Configure Online',
    desc: 'Place holes, rectangular cutouts and cable openings on any of the 6 sides using our live 3D editor.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: ShoppingBag,
    num: '03',
    title: 'Order & Deliver',
    desc: 'Get instant pricing, add to cart, and receive your custom-fabricated cabinet within 5 business days.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HeroFlow() {
  const [quickSelect, setQuickSelect] = useState<CabinetKey>('standard');

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(92,124,250,0.08),transparent)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Industrial Enclosure Configurator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
            Design Your Custom Cabinet
            <span className="block text-brand-600">In Three Simple Steps</span>
          </h1>
          <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Select an ARLI IP65 enclosure, configure cutouts with our live 3D editor, and order — all from your browser.
            No CAD software needed.
          </p>
        </motion.div>

        {/* 3-Step Flow Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16"
        >
          {STEPS.map((step, i) => (
            <motion.div key={step.num} variants={item} className="relative">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 h-full hover:shadow-lg hover:border-slate-300 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-4`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <div className="text-xs font-bold text-slate-300 mb-1">{step.num}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
              {/* Arrow between cards */}
              {i < 2 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Start Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="text-center mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Quick Start</h3>
              <p className="text-sm text-slate-500 mt-1">Pick a model and jump straight into the configurator</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {CABINET_KEYS.map(key => {
                const cab = CABINETS[key];
                const active = quickSelect === key;
                return (
                  <button
                    key={key}
                    onClick={() => setQuickSelect(key)}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      active
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {/* Mini cabinet shape */}
                    <div className="flex justify-center mb-2">
                      <div
                        className={`rounded-sm border ${active ? 'border-brand-400 bg-brand-100' : 'border-slate-300 bg-slate-200'}`}
                        style={{
                          width: Math.round(cab.w / 25),
                          height: Math.round(cab.h / 18),
                        }}
                      />
                    </div>
                    <div className="text-xs font-medium text-slate-700 truncate">{cab.name.split('—')[1]?.trim()}</div>
                    <div className="text-[10px] text-slate-400">{cab.w}×{cab.h}×{cab.d}</div>
                  </button>
                );
              })}
            </div>

            <Link
              href={`/configure?cabinet=${quickSelect}`}
              className="flex items-center justify-center gap-2 w-full h-11 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl transition"
            >
              Start Configuration
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
