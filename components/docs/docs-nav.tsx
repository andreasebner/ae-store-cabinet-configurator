'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BookOpen, MousePointer2, Shapes, Grid3X3,
  FileInput, Download, Ruler, Plug, ShoppingCart, HelpCircle,
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      { href: '/docs', label: 'Overview', icon: BookOpen },
      { href: '/docs/selecting-a-cabinet', label: 'Selecting a Cabinet', icon: Shapes },
    ],
  },
  {
    title: 'Using the Configurator',
    items: [
      { href: '/docs/editor-basics', label: 'Editor Basics', icon: MousePointer2 },
      { href: '/docs/placing-cutouts', label: 'Placing Cutouts', icon: Shapes },
      { href: '/docs/alignment-tools', label: 'Alignment Tools', icon: Grid3X3 },
      { href: '/docs/constraints', label: 'Constraints & Dimensions', icon: Ruler },
      { href: '/docs/components', label: 'Component Library', icon: Plug },
    ],
  },
  {
    title: 'Import & Export',
    items: [
      { href: '/docs/import-dxf', label: 'Importing DXF Files', icon: FileInput },
      { href: '/docs/custom-shapes', label: 'Custom Shapes (Inkscape & CAD)', icon: Shapes },
      { href: '/docs/export-project', label: 'Exporting Projects', icon: Download },
    ],
  },
  {
    title: 'Ordering',
    items: [
      { href: '/docs/pricing', label: 'Pricing & Cart', icon: ShoppingCart },
      { href: '/docs/faq', label: 'FAQ', icon: HelpCircle },
    ],
  },
];

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 hidden md:block">
      <div className="sticky top-24 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {section.title}
            </h4>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-lg transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-700 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
