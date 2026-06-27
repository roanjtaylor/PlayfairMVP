'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import type { PortfolioCompany } from '@/lib/types';

interface Props {
  company: PortfolioCompany;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;
}

export default function PortfolioCard({ company, selected, onClick, onRemove }: Props) {
  const [logoFailed, setLogoFailed] = useState(false);
  const initials = company.name.replace(/[^A-Z]/g, '').slice(0, 2) ||
    company.name.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative w-full text-left p-4 rounded-xl border transition-all duration-150',
        selected
          ? 'border-[#111111] bg-[#111111]'
          : 'border-[#EBEBEB] bg-white hover:border-[#AAAAAA]'
      )}
    >
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F0F0F0] hover:bg-[#E0E0E0] flex items-center justify-center transition-colors z-10"
        >
          <X className="w-3 h-3 text-[#666]" />
        </button>
      )}

      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-[#F5F5F5] flex items-center justify-center">
          {company.logoUrl && !logoFailed ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-full h-full object-contain p-1"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span
              className="text-xs font-bold text-white"
              style={{ backgroundColor: company.accentColor ?? '#111111', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {initials}
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className={clsx('text-[13px] font-semibold truncate', selected ? 'text-white' : 'text-[#111111]')}>
            {company.name}
          </p>
          <p className={clsx('text-[11px] truncate mt-0.5', selected ? 'text-[#888]' : 'text-[#999]')}>
            {company.sector}
          </p>
        </div>
      </div>
    </button>
  );
}
