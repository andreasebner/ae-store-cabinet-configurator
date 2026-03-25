import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-3">
              <span className="text-lg font-bold text-white">YourCabinet <span className="text-brand-400">Pro</span></span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 -mt-0.5">by DeFctory</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Industrial control cabinet configurator. Design and order custom enclosures online.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Compact Cabinets</a></li>
              <li><a href="#" className="hover:text-white transition">Standard Enclosures</a></li>
              <li><a href="#" className="hover:text-white transition">Large Enclosures</a></li>
              <li><a href="#" className="hover:text-white transition">Industrial Cabinets</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition">Technical Specs</a></li>
              <li><a href="#" className="hover:text-white transition">CAD Downloads</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">About DeFctory</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} DeFctory GmbH. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-white transition">Imprint</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
