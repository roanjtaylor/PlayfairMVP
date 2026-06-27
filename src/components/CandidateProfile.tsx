'use client';
import { Github, Linkedin, Search, Globe, GraduationCap } from 'lucide-react';
import type { Candidate } from '@/lib/types';

interface Props { candidate: Candidate; }

function Avatar({ name, photo }: { name: string; photo?: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#0F172A'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  if (photo) return <img src={photo} alt={name} className="w-14 h-14 rounded-full object-cover" />;
  return (
    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
      style={{ backgroundColor: bg }}>{initials}</div>
  );
}

function LinkBtn({ href, icon, label, dark }: { href?: string|null; icon: React.ReactNode; label: string; dark?: boolean }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-lg font-medium transition-colors ${
        dark ? 'bg-[#111] text-white hover:bg-[#333]' : 'bg-[#F5F5F5] text-[#555] hover:bg-[#EBEBEB]'
      }`}>
      {icon}{label}
    </a>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest mb-1.5">{label}</p>
      {children}
    </div>
  );
}

export default function CandidateProfile({ candidate }: Props) {
  const scoreColor = candidate.founderReadiness >= 85 ? '#059669' : candidate.founderReadiness >= 70 ? '#2563EB' : '#999';

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar name={candidate.name} photo={candidate.photo} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <h2 className="text-[16px] font-bold text-[#111] leading-tight">{candidate.name}</h2>
              <span className="text-[13px] font-bold shrink-0 mt-0.5" style={{ color: scoreColor }}>
                {candidate.founderReadiness}%
              </span>
            </div>
            <p className="text-[12px] text-[#666] mt-0.5">{candidate.currentRole} · {candidate.currentOrg}</p>
            <p className="text-[11px] text-[#BBB] mt-0.5">{candidate.technicalArea}</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-1.5">
          <LinkBtn href={candidate.links.github} icon={<Github className="w-3.5 h-3.5"/>} label="GitHub" dark />
          <LinkBtn href={candidate.links.linkedin} icon={<Linkedin className="w-3.5 h-3.5"/>} label="LinkedIn" dark />
          {candidate.links.openAlex && <LinkBtn href={candidate.links.openAlex} icon={<GraduationCap className="w-3.5 h-3.5"/>} label="Papers" />}
          <LinkBtn href={candidate.links.google} icon={<Search className="w-3.5 h-3.5"/>} label="Search" />
          {candidate.links.website && <LinkBtn href={candidate.links.website} icon={<Globe className="w-3.5 h-3.5"/>} label="Web" />}
        </div>

        <div className="h-px bg-[#F0F0F0]" />

        {/* Why */}
        <Block label="Why this person">
          <p className="text-[13px] text-[#444] leading-relaxed">{candidate.whyThisPerson}</p>
        </Block>
        <Block label="Why Playfair">
          <p className="text-[13px] text-[#444] leading-relaxed">{candidate.whyPlayfair}</p>
        </Block>
        <Block label="Why now">
          <p className="text-[13px] text-[#444] leading-relaxed">{candidate.whyNow}</p>
        </Block>

        {/* Readiness evidence */}
        <Block label="Signals">
          <div className="space-y-1">
            {candidate.readinessEvidence.map((e) => (
              <div key={e} className="flex items-start gap-2 text-[12px] text-[#555]">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{e}
              </div>
            ))}
          </div>
        </Block>

        {/* Next step */}
        <div className="p-3.5 bg-[#F8F8F8] rounded-xl border border-[#EBEBEB]">
          <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest mb-1.5">Suggested next step</p>
          <p className="text-[13px] text-[#111] leading-relaxed">{candidate.suggestedNextStep}</p>
        </div>

        {/* Connection path */}
        {candidate.connectionPath.length > 0 && (
          <Block label="Connection path">
            <div className="flex items-center gap-1 flex-wrap">
              {candidate.connectionPath.map((step, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="text-[11px] text-[#666] px-2 py-0.5 bg-[#F5F5F5] rounded">{step}</span>
                  {i < candidate.connectionPath.length - 1 && <span className="text-[#CCC] text-[10px]">→</span>}
                </span>
              ))}
            </div>
          </Block>
        )}

        {/* Technical themes */}
        {candidate.technicalThemes.length > 0 && (
          <Block label="Technical themes">
            <div className="flex flex-wrap gap-1.5">
              {candidate.technicalThemes.map((t) => (
                <span key={t} className="text-[11px] px-2 py-0.5 bg-[#F5F5F5] text-[#555] rounded">{t}</span>
              ))}
            </div>
          </Block>
        )}

        {/* Timeline */}
        {candidate.evidenceTimeline.length > 0 && (
          <Block label="Timeline">
            <div className="space-y-2.5">
              {candidate.evidenceTimeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[11px] text-[#BBB] w-8 shrink-0">{item.year}</span>
                  <p className="text-[12px] text-[#555] leading-relaxed">{item.event}</p>
                </div>
              ))}
            </div>
          </Block>
        )}
      </div>
    </div>
  );
}
