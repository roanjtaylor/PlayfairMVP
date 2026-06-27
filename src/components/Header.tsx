'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-[#EBEBEB] h-12 shrink-0">
      <div className="max-w-screen-xl mx-auto px-5 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold text-[13px] tracking-wide text-[#111111]">PLAYFAIR</span>
          <span className="text-[#999] text-[13px] font-light tracking-wide">MAP</span>
        </Link>
        <a
          href="https://playfair.vc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-[#999] hover:text-[#111] transition-colors"
        >
          playfair.vc ↗
        </a>
      </div>
    </header>
  );
}
