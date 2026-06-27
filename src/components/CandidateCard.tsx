'use client';
import clsx from 'clsx';
import type { Candidate } from '@/lib/types';

interface Props {
  candidate: Candidate;
  selected: boolean;
  checked?: boolean;
  showCheckbox?: boolean;
  onClick: () => void;
  onCheck?: (checked: boolean) => void;
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#0F172A'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  if (photo) return <img src={photo} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
      style={{ backgroundColor: bg }}>{initials}</div>
  );
}

function Score({ score }: { score: number }) {
  const color = score >= 85 ? '#059669' : score >= 70 ? '#2563EB' : '#999';
  return <span className="text-[11px] font-semibold ml-auto shrink-0" style={{ color }}>{score}%</span>;
}

export default function CandidateCard({ candidate, selected, checked, showCheckbox, onClick, onCheck }: Props) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2.5 px-3 py-3 rounded-lg border cursor-pointer transition-all',
        selected ? 'border-[#111] bg-[#FAFAFA]' : 'border-transparent hover:border-[#EBEBEB] hover:bg-[#FAFAFA]'
      )}
      onClick={onClick}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => { e.stopPropagation(); onCheck?.(e.target.checked); }}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-[#CCC] accent-[#111] shrink-0"
        />
      )}
      <Avatar name={candidate.name} photo={candidate.photo} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-semibold text-[#111] truncate">{candidate.name}</span>
          <Score score={candidate.founderReadiness} />
        </div>
        <p className="text-[11px] text-[#999] truncate mt-0.5">
          {candidate.currentRole} · {candidate.currentOrg}
        </p>
      </div>
    </div>
  );
}
