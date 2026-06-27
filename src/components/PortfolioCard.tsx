'use client';
import clsx from 'clsx';
import type { PortfolioCompany } from '@/lib/types';

interface Props {
  company: PortfolioCompany;
  selected: boolean;
  onClick: () => void;
}

export default function PortfolioCard({ company, selected, onClick }: Props) {
  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border transition-all duration-150 hover:shadow-md group',
        selected
          ? 'border-[#2563EB] bg-blue-50 shadow-sm shadow-blue-100'
          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Logo placeholder */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: company.accentColor ?? '#2563EB' }}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={clsx(
                'font-semibold text-sm truncate',
                selected ? 'text-[#1E40AF]' : 'text-[#0F172A]'
              )}
            >
              {company.name}
            </span>
          </div>
          <p className="text-xs text-[#64748B] truncate">{company.subsector ?? company.sector}</p>
          <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B]">
          {company.stage}
        </span>
        <span className="text-[10px] text-[#94A3B8]">{company.hq}</span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1">
        {company.founders.map((f) => (
          <span key={f.name} className="text-[10px] font-medium text-[#475569]">
            {f.name.split(' ')[0]}
          </span>
        ))}
      </div>
    </button>
  );
}
