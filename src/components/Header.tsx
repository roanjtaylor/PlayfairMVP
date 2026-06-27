'use client';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-[#EAEAF5] h-12 shrink-0">
      <div className="max-w-screen-xl mx-auto px-5 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full border-2 border-[#7B7FD4] flex items-center justify-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B7FD4]" />
          </span>
          <span className="font-semibold text-[13px] tracking-wide text-[#7B7FD4]">PLAYFAIR</span>
          <span className="text-[#C0C0D8] text-[13px] font-light tracking-wide">MAP</span>
        </Link>
        <a
          href="https://playfair.vc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-[#999] hover:text-[#7B7FD4] transition-colors"
        >
          playfair.vc ↗
        </a>
      </div>
    </header>
  );
}
