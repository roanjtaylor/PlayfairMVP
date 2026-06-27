'use client';
import { Github, Linkedin, Search, Globe, GraduationCap, ArrowRight, ChevronRight } from 'lucide-react';
import type { Candidate } from '@/lib/types';

interface Props {
  candidate: Candidate;
}

function Avatar({ name, photo }: { name: string; photo?: string }) {
  if (photo) return <img src={photo} alt={name} className="w-16 h-16 rounded-2xl object-cover" />;
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
      style={{ backgroundColor: colors[idx] }}
    >
      {initials}
    </div>
  );
}

function ReadinessBar({ score }: { score: number }) {
  const color = score >= 90 ? '#059669' : score >= 75 ? '#2563EB' : score >= 60 ? '#D97706' : '#64748B';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          Founder Readiness
        </span>
        <span className="text-2xl font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  className = '',
}: {
  href?: string | null;
  icon: React.ReactNode;
  label: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all hover:opacity-80 ${className}`}
    >
      {icon}
      {label}
    </a>
  );
}

export default function CandidateProfile({ candidate }: Props) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar name={candidate.name} photo={candidate.photo} />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-[#0F172A] leading-tight">{candidate.name}</h2>
            <p className="text-sm text-[#475569] mt-0.5">
              {candidate.currentRole}
            </p>
            <p className="text-sm text-[#94A3B8]">{candidate.currentOrg}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          <QuickLink
            href={candidate.links.github}
            icon={<Github className="w-3.5 h-3.5" />}
            label="GitHub"
            className="bg-[#0F172A] text-white"
          />
          <QuickLink
            href={candidate.links.linkedin}
            icon={<Linkedin className="w-3.5 h-3.5" />}
            label="LinkedIn"
            className="bg-[#0A66C2] text-white"
          />
          {candidate.links.openAlex && (
            <QuickLink
              href={candidate.links.openAlex}
              icon={<GraduationCap className="w-3.5 h-3.5" />}
              label="OpenAlex"
              className="bg-[#7C3AED] text-white"
            />
          )}
          <QuickLink
            href={candidate.links.google}
            icon={<Search className="w-3.5 h-3.5" />}
            label="Google"
            className="bg-[#F1F5F9] text-[#64748B]"
          />
          {candidate.links.website && (
            <QuickLink
              href={candidate.links.website}
              icon={<Globe className="w-3.5 h-3.5" />}
              label="Website"
              className="bg-[#F1F5F9] text-[#64748B]"
            />
          )}
        </div>

        {/* Readiness */}
        <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <ReadinessBar score={candidate.founderReadiness} />
          <div className="mt-3 space-y-1.5">
            {candidate.readinessEvidence.map((evidence) => (
              <div key={evidence} className="flex items-center gap-2 text-xs text-[#475569]">
                <span className="text-emerald-500 font-bold shrink-0">✓</span>
                {evidence}
              </div>
            ))}
          </div>
        </div>

        {/* Connection path */}
        <Section title="Relationship Path">
          <div className="flex items-center gap-1 flex-wrap">
            {candidate.connectionPath.map((step, i) => (
              <span key={i} className="flex items-center gap-1">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    i === 0
                      ? 'bg-[#DBEAFE] text-[#1E40AF]'
                      : i === candidate.connectionPath.length - 1
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  {step}
                </span>
                {i < candidate.connectionPath.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
                )}
              </span>
            ))}
          </div>
        </Section>

        {/* AI Analysis */}
        <Section title="Why This Person">
          <p className="text-sm text-[#475569] leading-relaxed">{candidate.whyThisPerson}</p>
        </Section>

        <Section title="Why Playfair">
          <p className="text-sm text-[#475569] leading-relaxed">{candidate.whyPlayfair}</p>
        </Section>

        <Section title="Why Now">
          <p className="text-sm text-[#475569] leading-relaxed">{candidate.whyNow}</p>
        </Section>

        {/* Suggested next step */}
        <div className="p-4 bg-[#0F172A] rounded-xl">
          <div className="flex items-start gap-2">
            <ArrowRight className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-[#475569] uppercase tracking-wider mb-1">
                Suggested Next Step
              </p>
              <p className="text-sm text-white leading-relaxed">{candidate.suggestedNextStep}</p>
            </div>
          </div>
        </div>

        {/* Technical themes */}
        {candidate.technicalThemes.length > 0 && (
          <Section title="Technical Themes">
            <div className="flex flex-wrap gap-1.5">
              {candidate.technicalThemes.map((theme) => (
                <span
                  key={theme}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] font-medium"
                >
                  {theme}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Evidence timeline */}
        {candidate.evidenceTimeline.length > 0 && (
          <Section title="Evidence Timeline">
            <div className="relative pl-4">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-[#E2E8F0]" />
              <div className="space-y-3">
                {candidate.evidenceTimeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-4 top-1.5 w-2 h-2 rounded-full bg-[#CBD5E1] border-2 border-white" />
                    <div className="text-[10px] font-semibold text-[#94A3B8] mb-0.5">{item.year}</div>
                    <p className="text-xs text-[#475569] leading-relaxed">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Founder signals */}
        {(candidate.founderSignals.projects?.length || candidate.founderSignals.research?.length || candidate.founderSignals.talks?.length) ? (
          <Section title="Founder Signals">
            <div className="space-y-2">
              {candidate.founderSignals.research?.map((r) => (
                <div key={r} className="flex items-start gap-2 text-xs text-[#475569]">
                  <GraduationCap className="w-3 h-3 text-[#7C3AED] shrink-0 mt-0.5" />
                  {r}
                </div>
              ))}
              {candidate.founderSignals.projects?.map((p) => (
                <div key={p} className="flex items-start gap-2 text-xs text-[#475569]">
                  <Github className="w-3 h-3 text-[#64748B] shrink-0 mt-0.5" />
                  {p}
                </div>
              ))}
            </div>
          </Section>
        ) : null}
      </div>
    </div>
  );
}
