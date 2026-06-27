'use client';
import { useState } from 'react';
import { Loader2, BookOpen, ChevronDown, ChevronUp, MessageSquare, HelpCircle, AlertTriangle, Zap } from 'lucide-react';
import type { Candidate, PortfolioCompany, StudyReport } from '@/lib/types';

interface Props {
  candidates: Candidate[];
  company: PortfolioCompany;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

const VERDICT_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  strong:      { label: 'Reach out this week', color: '#059669', bg: '#ECFDF5' },
  interesting: { label: 'Add to watchlist',    color: '#2563EB', bg: '#EFF6FF' },
  monitor:     { label: 'Check back in 6m',    color: '#999',    bg: '#F5F5F5' },
};

function ReportCard({ report }: { report: StudyReport }) {
  const [open, setOpen] = useState(true);
  const v = VERDICT_STYLE[report.verdict] ?? VERDICT_STYLE.monitor;

  return (
    <div className="border border-[#EBEBEB] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-[#FAFAFA] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[14px] font-semibold text-[#111]">{report.candidateName}</span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: v.color, background: v.bg }}>
            {v.label}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#BBB]" /> : <ChevronDown className="w-4 h-4 text-[#BBB]" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-4 border-t border-[#F0F0F0] bg-[#FAFAFA]">
          <div>
            <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest mb-1.5">Assessment</p>
            <p className="text-[13px] text-[#444] leading-relaxed">{report.deepAssessment}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <Zap className="w-3 h-3 text-emerald-500" />
                <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">Strengths</p>
              </div>
              <ul className="space-y-1">
                {report.strengths.map((s) => (
                  <li key={s} className="text-[12px] text-[#555] flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">Concerns</p>
              </div>
              <ul className="space-y-1">
                {report.concerns.map((c) => (
                  <li key={c} className="text-[12px] text-[#555] flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-lg border border-[#EBEBEB]">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-[#999]" />
              <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">Outreach draft</p>
            </div>
            <p className="text-[13px] text-[#444] leading-relaxed italic">"{report.outreachMessage}"</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#999]" />
              <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">Due diligence</p>
            </div>
            <ol className="space-y-1.5">
              {report.dueDiligenceQuestions.map((q, i) => (
                <li key={i} className="text-[12px] text-[#555] flex items-start gap-2">
                  <span className="text-[#CCC] shrink-0 font-medium">{i + 1}.</span>{q}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudyView({ candidates, company, selectedIds, onToggle }: Props) {
  const [reports, setReports] = useState<StudyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const selected = candidates.filter((c) => selectedIds.has(c.id));

  const runStudy = async () => {
    if (!selected.length) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates: selected, company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Study failed');
      setReports(data.reports);
      setRan(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] bg-white shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-[#999]" />
          <span className="text-[13px] font-semibold text-[#111]">Study Mode</span>
        </div>
        <p className="text-[11px] text-[#999]">Select candidates in the list to generate deep-study reports.</p>
      </div>

      {/* Action bar */}
      <div className="px-4 py-3 border-b border-[#EBEBEB] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#999] flex-1">
            {selected.length === 0
              ? 'No candidates selected'
              : `${selected.length} candidate${selected.length > 1 ? 's' : ''} selected`}
          </span>
          {selected.length > 0 && (
            <button
              onClick={runStudy}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] text-white text-[12px] font-semibold rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
              {loading ? 'Studying…' : `Study ${selected.length}`}
            </button>
          )}
        </div>
        {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
      </div>

      {/* Reports */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!ran && !loading && (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-[#E0E0E0] mx-auto mb-3" />
            <p className="text-[13px] text-[#BBB]">Select candidates on the left, then click Study to generate deep-research reports.</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-[#CCC] animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-[#BBB]">Claude is writing deep assessments…</p>
          </div>
        )}
        {reports.map((r) => <ReportCard key={r.candidateId} report={r} />)}
      </div>
    </div>
  );
}
