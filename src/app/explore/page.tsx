'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Users, Github, BookOpen, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import CandidateCard from '@/components/CandidateCard';
import CandidateProfile from '@/components/CandidateProfile';
import type { ExpansionResult, Candidate } from '@/lib/types';

// React Flow must be client-only
const TrustGraph = dynamic(() => import('@/components/TrustGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0A0E1A] rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#475569]">Rendering graph…</p>
      </div>
    </div>
  ),
});

function SourceBadge({ sources }: { sources: string[] }) {
  const icons: Record<string, React.ReactNode> = {
    github: <Github className="w-3 h-3" />,
    academic: <BookOpen className="w-3 h-3" />,
    web: <Globe className="w-3 h-3" />,
  };
  return (
    <div className="flex items-center gap-1.5">
      {sources.map((s) => (
        <span key={s} className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8]">
          {icons[s]} {s}
        </span>
      ))}
    </div>
  );
}

function LoadingState({ companyName }: { companyName: string }) {
  const steps = [
    { id: 'github', label: 'Searching GitHub ecosystem…', icon: <Github className="w-3.5 h-3.5" /> },
    { id: 'academic', label: 'Querying academic databases…', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'Claude is analysing trust connections…', icon: <span className="text-xs">AI</span> },
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2500);
    const t2 = setTimeout(() => setStep(2), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0A0E1A]">
      <div className="text-center max-w-sm">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-[#2563EB]/30 rounded-full animate-ping" />
          <div className="absolute inset-2 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 bg-[#2563EB] rounded-full" />
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">
          Expanding the {companyName} network
        </h2>
        <p className="text-sm text-[#475569] mb-8">
          Finding exceptional people connected to your trusted founders.
        </p>

        <div className="space-y-3 text-left">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < step
                  ? 'text-emerald-400'
                  : i === step
                  ? 'text-white'
                  : 'text-[#334155]'
              }`}
            >
              <span className="shrink-0">
                {i < step ? (
                  <span className="text-emerald-400 font-bold">✓</span>
                ) : i === step ? (
                  <span className="animate-spin inline-block">⟳</span>
                ) : (
                  <span className="text-[#334155]">○</span>
                )}
              </span>
              {s.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center max-w-md p-8">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Network Expansion Failed</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-[#1E293B] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();

  const companyId = params.get('company') ?? '';
  const sources = (params.get('sources') ?? 'github,academic').split(',').filter(Boolean);
  const depth = (Number(params.get('depth')) || 1) as 1 | 2;
  const location = params.get('location') ?? 'UK';

  const [result, setResult] = useState<ExpansionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const expand = useCallback(async () => {
    if (!companyId) { router.replace('/'); return; }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, sources, depth, location }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setResult(data);
      if (data.candidates?.length > 0) {
        setSelectedCandidate(data.candidates[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [companyId, sources.join(','), depth, location]);

  useEffect(() => { expand(); }, [expand]);

  const companyName = result?.company?.name ?? companyId;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0E1A]">
        <Header />
        <LoadingState companyName={companyName} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <ErrorState message={error} onRetry={expand} />
      </div>
    );
  }

  if (!result) return null;

  const { company, candidates } = result;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header />

      {/* Toolbar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center gap-4 shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
        </button>

        <div className="h-4 w-px bg-[#E2E8F0]" />

        <div
          className="w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
          style={{ backgroundColor: company.accentColor ?? '#2563EB' }}
        >
          {company.name[0]}
        </div>
        <span className="font-semibold text-sm text-[#0F172A]">{company.name}</span>
        <span className="text-xs text-[#94A3B8]">{company.subsector ?? company.sector}</span>

        <div className="h-4 w-px bg-[#E2E8F0]" />
        <SourceBadge sources={sources} />

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#0F172A]">{candidates.length}</span> candidates
          </div>
          <button
            onClick={expand}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-[#64748B] hover:bg-[#E2E8F0] transition-colors font-medium"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Main three-panel layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: Candidate list */}
        <div className="w-72 shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#F1F5F9]">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              {candidates.length} candidates · sorted by readiness
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {[...candidates]
              .sort((a, b) => b.founderReadiness - a.founderReadiness)
              .map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  selected={selectedCandidate?.id === c.id}
                  onClick={() => setSelectedCandidate(c)}
                />
              ))}
          </div>
        </div>

        {/* Centre: Trust graph */}
        <div className="flex-1 relative overflow-hidden">
          <TrustGraph
            company={company}
            candidates={candidates}
            selectedCandidateId={selectedCandidate?.id}
            onSelectCandidate={setSelectedCandidate}
          />
        </div>

        {/* Right: Candidate profile */}
        <div className="w-96 shrink-0 bg-white border-l border-[#E2E8F0] overflow-hidden flex flex-col">
          {selectedCandidate ? (
            <CandidateProfile candidate={selectedCandidate} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-3">
                  <Users className="w-5 h-5 text-[#94A3B8]" />
                </div>
                <p className="text-sm font-medium text-[#0F172A] mb-1">Select a candidate</p>
                <p className="text-xs text-[#94A3B8]">
                  Click any node in the graph or a card on the left to view their full profile.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#0A0E1A]">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#475569]">Loading…</p>
            </div>
          </div>
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  );
}
