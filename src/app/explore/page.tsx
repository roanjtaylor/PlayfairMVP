'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Users,
  Github,
  BookOpen,
  Globe,
  RefreshCw,
  AlertCircle,
  LayoutList,
  Network,
  UserCircle,
} from 'lucide-react';
import Header from '@/components/Header';
import CandidateCard from '@/components/CandidateCard';
import CandidateProfile from '@/components/CandidateProfile';
import type { ExpansionResult, Candidate } from '@/lib/types';

const TrustGraph = dynamic(() => import('@/components/TrustGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0A0E1A] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#475569]">Rendering graph…</p>
      </div>
    </div>
  ),
});

type Tab = 'candidates' | 'graph' | 'profile';

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

function LoadingScreen({ companyName }: { companyName: string }) {
  const steps = [
    'Searching GitHub ecosystem…',
    'Querying academic databases…',
    'Claude is analysing trust connections…',
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2500);
    const t2 = setTimeout(() => setStep(2), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0A0E1A] px-6">
      <div className="text-center max-w-sm w-full">
        <div className="relative w-14 h-14 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-[#2563EB]/20 rounded-full animate-ping" />
          <div className="absolute inset-1 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-3 bg-[#2563EB] rounded-full" />
        </div>
        <h2 className="text-base font-semibold text-white mb-1">
          Expanding the {companyName} network
        </h2>
        <p className="text-sm text-[#475569] mb-8 leading-relaxed">
          Finding exceptional people connected to your trusted founders.
        </p>
        <div className="space-y-3 text-left">
          {steps.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < step ? 'text-emerald-400' : i === step ? 'text-white' : 'text-[#334155]'
              }`}
            >
              <span className="w-4 shrink-0 text-center">
                {i < step ? '✓' : i === step ? <span className="animate-spin inline-block">⟳</span> : '○'}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] px-6">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-2">Network Expansion Failed</h3>
        <p className="text-sm text-[#64748B] mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-[#1E293B] transition-colors mx-auto"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}

function MobileTabBar({ active, onChange, candidateCount }: { active: Tab; onChange: (t: Tab) => void; candidateCount: number }) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'candidates', label: `${candidateCount} Found`, icon: <LayoutList className="w-5 h-5" /> },
    { id: 'graph',      label: 'Graph',    icon: <Network className="w-5 h-5" /> },
    { id: 'profile',    label: 'Profile',  icon: <UserCircle className="w-5 h-5" /> },
  ];
  return (
    <div className="flex border-t border-[#E2E8F0] bg-white shrink-0 safe-area-bottom lg:hidden">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
            active === t.id ? 'text-[#2563EB]' : 'text-[#94A3B8]'
          }`}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();

  const companyId  = params.get('company') ?? '';
  const sources    = (params.get('sources') ?? 'github,academic').split(',').filter(Boolean);
  const depth      = (Number(params.get('depth')) || 1) as 1 | 2;
  const location   = params.get('location') ?? 'UK';

  const [result, setResult]             = useState<ExpansionResult | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedCandidate, setSelected] = useState<Candidate | null>(null);
  const [activeTab, setActiveTab]        = useState<Tab>('candidates');

  const expand = useCallback(async () => {
    if (!companyId) { router.replace('/'); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/expand', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ companyId, sources, depth, location }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
      if (data.candidates?.length > 0) setSelected(data.candidates[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [companyId, sources.join(','), depth, location]); // eslint-disable-line

  useEffect(() => { expand(); }, [expand]);

  // When candidate is selected on mobile, jump to profile tab
  const handleSelectCandidate = useCallback((c: Candidate) => {
    setSelected(c);
    setActiveTab('profile');
  }, []);

  const companyName = result?.company?.name ?? companyId;

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#0A0E1A]">
        <Header />
        <LoadingScreen companyName={companyName} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <ErrorScreen message={error} onRetry={expand} />
      </div>
    );
  }

  if (!result) return null;

  const { company, candidates } = result;
  const sorted = [...candidates].sort((a, b) => b.founderReadiness - a.founderReadiness);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header />

      {/* Toolbar */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-2.5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#0F172A] transition-colors font-medium shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Portfolio</span>
        </button>

        <div className="h-4 w-px bg-[#E2E8F0]" />

        <div
          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-bold shrink-0"
          style={{ backgroundColor: company.accentColor ?? '#2563EB' }}
        >
          {company.name[0]}
        </div>
        <span className="font-semibold text-sm text-[#0F172A] truncate">{company.name}</span>
        <span className="text-xs text-[#94A3B8] hidden sm:block truncate">{company.subsector ?? company.sector}</span>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5">
            <SourceBadge sources={sources} />
          </div>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#0F172A]">{candidates.length}</span>
          </div>
          <button
            onClick={expand}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#F1F5F9] rounded-lg text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP: three-panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {/* Left: Candidate list */}
        <div className="w-72 shrink-0 bg-white border-r border-[#E2E8F0] flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#F1F5F9]">
            <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              {candidates.length} candidates · sorted by readiness
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {sorted.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                selected={selectedCandidate?.id === c.id}
                onClick={() => setSelected(c)}
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
            onSelectCandidate={setSelected}
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
                  Click any node in the graph or a card on the left.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE: tabbed single-panel ── */}
      <div className="flex lg:hidden flex-1 overflow-hidden flex-col">
        {/* Candidates tab */}
        {activeTab === 'candidates' && (
          <div className="flex-1 overflow-y-auto bg-white p-3 space-y-2">
            {sorted.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                selected={selectedCandidate?.id === c.id}
                onClick={() => handleSelectCandidate(c)}
              />
            ))}
          </div>
        )}

        {/* Graph tab */}
        {activeTab === 'graph' && (
          <div className="flex-1 relative overflow-hidden">
            <TrustGraph
              company={company}
              candidates={candidates}
              selectedCandidateId={selectedCandidate?.id}
              onSelectCandidate={handleSelectCandidate}
            />
          </div>
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-hidden bg-white">
            {selectedCandidate ? (
              <CandidateProfile candidate={selectedCandidate} />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <UserCircle className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#0F172A] mb-1">No candidate selected</p>
                  <p className="text-xs text-[#94A3B8]">
                    Go to the Candidates tab and tap a name.
                  </p>
                  <button
                    onClick={() => setActiveTab('candidates')}
                    className="mt-4 px-4 py-2 bg-[#0F172A] text-white rounded-xl text-sm font-medium"
                  >
                    View Candidates
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <MobileTabBar
        active={activeTab}
        onChange={setActiveTab}
        candidateCount={candidates.length}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex flex-col bg-[#0A0E1A]">
          <div className="bg-[#0A0E1A] border-b border-white/5 h-14" />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <ExploreInner />
    </Suspense>
  );
}
