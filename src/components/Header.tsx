'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#0A0E1A] border-b border-white/5">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-md bg-playfair-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-white font-semibold tracking-tight">
            Playfair <span className="text-playfair-blue-light font-light">Map</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={clsx(
              'px-3 py-1.5 rounded-md text-sm transition-colors',
              pathname === '/'
                ? 'text-white bg-white/10'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            )}
          >
            Portfolio
          </Link>
          <a
            href="https://playfair.vc"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            Playfair.vc ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
