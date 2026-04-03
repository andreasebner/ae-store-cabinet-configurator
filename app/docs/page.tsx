import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, MousePointer2, Shapes, FileInput, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = { title: 'Documentation — YourCabinet Pro' };

const HIGHLIGHTS = [
  {
    icon: MousePointer2,
    title: 'Editor Basics',
    desc: 'Learn how to navigate the 2D panel editor, select tools, and place elements.',
    href: '/docs/editor-basics',
  },
  {
    icon: Shapes,
    title: 'Placing Cutouts',
    desc: 'Add circular holes, rectangular openings, and text labels to any panel side.',
    href: '/docs/placing-cutouts',
  },
  {
    icon: FileInput,
    title: 'Custom Shapes & DXF Import',
    desc: 'Design shapes in Inkscape or your CAD system and import them via DXF.',
    href: '/docs/custom-shapes',
  },
  {
    icon: ShoppingCart,
    title: 'Pricing & Ordering',
    desc: 'Understand how pricing works and place your order.',
    href: '/docs/pricing',
  },
];

export default function DocsOverview() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Documentation</h1>
      <p className="lead">
        Welcome to the YourCabinet Pro documentation. Learn how to configure ARLI IP65 enclosures
        using our online 3D/2D editor — from selecting a cabinet to exporting production-ready DXF files.
      </p>

      <h2>Quick Links</h2>
      <div className="not-prose grid sm:grid-cols-2 gap-4 my-6">
        {HIGHLIGHTS.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            className="group flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition">
              <h.icon className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm group-hover:text-brand-700 transition">
                {h.title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{h.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <h2>How It Works</h2>
      <ol>
        <li>
          <strong>Select a cabinet</strong> — Choose from our range of ARLI IP65 ABS enclosures on the{' '}
          <Link href="/">landing page</Link> or jump directly to the <Link href="/configure">configurator</Link>.
        </li>
        <li>
          <strong>Configure panels</strong> — Use the 2D editor to place holes, rectangular cutouts,
          components, and custom shapes on each panel side. The 3D preview updates in real-time.
        </li>
        <li>
          <strong>Export or order</strong> — Export your project as JSON or DXF for your workshop, or
          add the configured cabinet directly to your cart for online ordering.
        </li>
      </ol>

      <h2>System Requirements</h2>
      <ul>
        <li>A modern web browser (Chrome, Firefox, Edge, or Safari)</li>
        <li>WebGL support for the 3D preview</li>
        <li>JavaScript enabled</li>
        <li>No installation or plugins required</li>
      </ul>
    </article>
  );
}
