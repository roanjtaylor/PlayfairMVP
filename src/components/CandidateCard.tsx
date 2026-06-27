'use client';
import clsx from 'clsx';
import { Github, Linkedin, Search, GraduationCap } from 'lucide-react';
import type { Candidate } from '@/lib/types';

interface Props {
  candidate: Candidate;
  selected: boolean;
  onClick: () => void;
}

function ReadinessBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 75
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : score >= 60
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';

  return (
    <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded border', color)}>
      {score}%
    </span>
  );
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) {
    return <img src={photo} alt={name} className="w-9 h-9 rounded-full object-cover" />;
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: colors[idx] }}
    >
      {initials}
    </div>
  );
}

export default function CandidateCard({ candidate, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all duration-100',
        selected
          ? 'border-[#2563EB] bg-blue-50'
          : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-sm'
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={candidate.name} photo={candidate.photo} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={clsx('text-sm font-semibold truncate', selected ? 'text-[#1E40AF]' : 'text-[#0F172A]')}>
              {candidate.name}
            </span>
            <ReadinessBadge score={candidate.founderReadiness} />
          </div>
          <p className="text-xs text-[#64748B] truncate mt-0.5">
            {candidate.currentRole} · {candidate.currentOrg}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
            {candidate.summary}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] font-medium">
          {candidate.relationshipDistance === 1 ? '1 hop' : '2 hops'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#64748B] truncate">
          {candidate.technicalArea}
        </span>
        {candidate.source === 'github' && <Github className="w-3 h-3 text-[#94A3B8] ml-auto" />}
        {candidate.source === 'academic' && <GraduationCap className="w-3 h-3 text-[#94A3B8] ml-auto" />}
      </div>

      {selected && (
        <div className="mt-2.5 flex gap-1.5 animate-fade-in">
          {candidate.links.github && (
            <a
              href={candidate.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors"
            >
              <Github className="w-2.5 h-2.5" /> GitHub
            </a>
          )}
          {candidate.links.linkedin && (
            <a
              href={candidate.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#0A66C2] text-white hover:bg-[#084898] transition-colors"
            >
              <Linkedin className="w-2.5 h-2.5" /> LinkedIn
            </a>
          )}
          {candidate.links.google && (
            <a
              href={candidate.links.google}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
            >
              <Search className="w-2.5 h-2.5" /> Google
            </a>
          )}
        </div>
      )}
    </button>
  );
}
