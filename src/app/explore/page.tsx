'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, RefreshCw, AlertCircle, LayoutList, Network, UserCircle, BookOpen, SlidersHorizontal, X } from 'lucide-react';
import Header from '@/components/Header';
import CandidateCard from '@/components/CandidateCard';
import CandidateProfile from '@/components/CandidateProfile';
import StudyView from '@/components/StudyView';
import DiscoverySources from '@/components/DiscoverySources';
import type { ExpansionResult, Candidate, PortfolioCompany } from '@/lib/types';

const TrustGraph = dynamic(() => import('@/components/TrustGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0A0E1A] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type Mode = 'source' | 'study';
type Tab  = 'candidates' | 'graph' | 'profile' | 'study';

function LoadingScreen({ name }: { name: string }) {
  const steps = ['Searching GitHub ecosystem…', 'Querying academic databases…', 'Claude analysing connections…'];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2500);
    const t2 = setTimeout(() => setStep(2), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0A0E1A] px-6">
      <div className="text-center max-w-xs w-full">
        <div className="relative w-12 h-12 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-[#2563EB]/20 rounded-full animate-ping" />
          <div className="absolute inset-1 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[15px] font-semibold text-white mb-1">Expanding {name}</p>
        <p className="text-[13px] text-[#555] mb-8">Finding future founders in the trust graph.</p>
        <div className="space-y-2.5 text-left">
          {steps.map((label, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-[13px] transition-all duration-500 ${
              i < step ? 'text-emerald-400' : i === step ? 'text-white' : 'text-[#333]'
            }`}>
              <span className="w-4 text-center shrink-0">
                {i < step ? '✓' : i === step ? '⟳' : '○'}
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
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-[15px] font-semibold mb-1">Expansion failed</p>
        <p className="text-[13px] text-[#999] mb-5 leading-relaxed">{message}</p>
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-[#111] text-white text-[13px] font-medium rounded-xl mx-auto hover:bg-[#333] transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    </div>
  );
}

function SourcesPanel({ sources, depth, location, onUpdate, onClose }: {
  sources: string[]; depth: number; location: string;
  onUpdate: (s: string[], d: 1|2, l: string) => void; onClose: () => void;
}) {
  const [s, setS] = useState(sources);
  const [d, setD] = useState<1|2>(depth as 1|2);
  const [l, setL] = useState(location);
  return (
    <div className="absolute top-0 right-0 bottom-0 w-72 bg-white border-l border-[#EBEBEB] z-10 flex flex-col shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
        <span className="text-[13px] font-semibold">Refine Sources</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#F0F0F0]"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        <div>
          <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest mb-2">Sources</p>
          <DiscoverySources sources={s} onChange={setS} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest mb-2">Depth</p>
          <div className="grid grid-cols-2 gap-2">
            {([1, 2] as const).map((v) => (
              <button key={v} onClick={() => setD(v)}
                className={`py-2 text-[12px] font-medium rounded-lg border ${d === v ? 'bg-[#111] text-white border-[#111]' : 'border-[#EBEBEB] text-[#666] hover:border-[#AAA]'}`}>
                {v === 1 ? 'One hop' : 'Two hops'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest mb-2">Location</p>
          <div className="grid grid-cols-3 gap-2">
            {['UK', 'Europe', 'Global'].map((v) => (
              <button key={v} onClick={() => setL(v)}
                className={`py-1.5 text-[12px] font-medium rounded-lg border ${l === v ? 'bg-[#111] text-white border-[#111]' : 'border-[#EBEBEB] text-[#666] hover:border-[#AAA]'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-[#EBEBEB]">
        <button onClick={() => { onUpdate(s, d, l); onClose(); }}
          className="w-full py-2.5 bg-[#111] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Re-run expansion
        </button>
      </div>
    </div>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const router  = useRouter();

  const companyId   = params.get('company') ?? '';
  const companyData = params.get('companyData');
  const initSources = (params.get('sources') ?? 'github,academic').split(',').filter(Boolean);
  const initDepth   = (Number(params.get('depth')) || 1) as 1 | 2;
  const initLoc     = params.get('location') ?? 'UK';

  const [result, setResult]           = useState<ExpansionResult | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [selected, setSelected]       = useState<Candidate | null>(null);
  const [mode, setMode]               = useState<Mode>('source');
  const [activeTab, setActiveTab]     = useState<Tab>('candidates');
  const [checkedIds, setCheckedIds]   = useState<Set<string>>(new Set());
  const [showSources, setShowSources] = useState(false);

  const [sources, setSources] = useState(initSources);
  const [depth, setDepth]     = useState<1|2>(initDepth);
  const [location, setLoc]    = useState(initLoc);

  const expand = useCallback(async (s = sources, d = depth, l = location) => {
    setLoading(true);
    setError(null);
    setCheckedIds(new Set());
    try {
      const company: PortfolioCompany | undefined = companyData ? JSON.parse(companyData) : undefined;
      const res = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: companyId || undefined, company, sources: s, depth: d, location: l }),
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
  }, [companyId, companyData, sources, depth, location]); // eslint-disable-line

  useEffect(() => { expand(); }, []); // eslint-disable-line

  const handleRefine = (s: string[], d: 1|2, l: string) => {
    setSources(s); setDepth(d); setLoc(l);
    expand(s, d, l);
  };

  const handleSelect = useCallback((c: Candidate) => {
    setSelected(c);
    setActiveTab(mode === 'source' ? 'profile' : 'candidates');
  }, [mode]);

  const toggleCheck = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setActiveTab(m === 'source' ? 'candidates' : 'candidates');
  };

  if (loading) return (
    <div className="h-screen flex flex-col"><Header />
      <LoadingScreen name={result?.company?.name ?? companyId} />
    </div>
  );
  if (error)   return (
    <div className="h-screen flex flex-col"><Header />
      <ErrorScreen message={error} onRetry={() => expand()} />
    </div>
  );
  if (!result) return null;

  const { company, candidates } = result;
  const sorted = [...candidates].sort((a, b) => b.founderReadiness - a.founderReadiness);

  // ── Toolbar ─────────────────────────────────────────────────────────
  const Toolbar = (
    <div className="bg-white border-b border-[#EBEBEB] px-4 py-2 flex items-center gap-3 shrink-0">
      <button onClick={() => router.push('/')}
        className="flex items-center gap-1 text-[12px] text-[#999] hover:text-[#111] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Portfolio</span>
      </button>
      <div className="h-4 w-px bg-[#EBEBEB]" />
      <span className="text-[13px] font-semibold text-[#111] truncate">{company.name}</span>
      <span className="text-[11px] text-[#BBB] hidden sm:block">{candidates.length} found</span>

      {/* Mode toggle */}
      <div className="ml-auto flex items-center bg-[#F5F5F5] rounded-lg p-0.5">
        {(['source', 'study'] as Mode[]).map((m) => (
          <button key={m} onClick={() => switchMode(m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-md transition-all capitalize ${
              mode === m ? 'bg-white text-[#111] shadow-sm' : 'text-[#999] hover:text-[#666]'
            }`}>
            {m === 'source' ? <Network className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      <button onClick={() => setShowSources((p) => !p)}
        className="p-1.5 rounded-lg hover:bg-[#F0F0F0] transition-colors text-[#999] hover:text-[#111]">
        <SlidersHorizontal className="w-4 h-4" />
      </button>
      <button onClick={() => expand()}
        className="p-1.5 rounded-lg hover:bg-[#F0F0F0] transition-colors text-[#999] hover:text-[#111]">
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );

  // ── Desktop three-panel ──────────────────────────────────────────────
  const DesktopLayout = (
    <div className="hidden lg:flex flex-1 overflow-hidden relative">
      {/* Left: candidates */}
      <div className="w-64 shrink-0 bg-white border-r border-[#EBEBEB] flex flex-col overflow-hidden">
        <div className="px-3 py-2 border-b border-[#F0F0F0]">
          <p className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">
            {sorted.length} candidates
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {sorted.map((c) => (
            <CandidateCard key={c.id} candidate={c}
              selected={selected?.id === c.id}
              checked={checkedIds.has(c.id)}
              showCheckbox={mode === 'study'}
              onClick={() => { setSelected(c); if (mode === 'source') {} }}
              onCheck={() => toggleCheck(c.id)}
            />
          ))}
        </div>
      </div>

      {/* Centre: graph */}
      <div className="flex-1 relative overflow-hidden">
        <TrustGraph company={company} candidates={candidates}
          selectedCandidateId={selected?.id} onSelectCandidate={handleSelect} />
      </div>

      {/* Right: profile or study */}
      <div className="w-80 shrink-0 bg-white border-l border-[#EBEBEB] overflow-hidden flex flex-col">
        {mode === 'source' ? (
          selected ? <CandidateProfile candidate={selected} /> :
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <p className="text-[13px] text-[#BBB]">Select a candidate to view their profile</p>
            </div>
        ) : (
          <StudyView candidates={sorted} company={company} selectedIds={checkedIds} onToggle={toggleCheck} />
        )}
      </div>

      {/* Sources panel overlay */}
      {showSources && (
        <SourcesPanel sources={sources} depth={depth} location={location}
          onUpdate={handleRefine} onClose={() => setShowSources(false)} />
      )}
    </div>
  );

  // ── Mobile tabbed ────────────────────────────────────────────────────
  const mobileTabs: { id: Tab; label: string; icon: React.ReactNode }[] = mode === 'source'
    ? [
        { id: 'candidates', label: `${sorted.length}`,     icon: <LayoutList className="w-5 h-5" /> },
        { id: 'graph',      label: 'Graph',                 icon: <Network className="w-5 h-5" /> },
        { id: 'profile',    label: 'Profile',               icon: <UserCircle className="w-5 h-5" /> },
      ]
    : [
        { id: 'candidates', label: `${sorted.length}`,     icon: <LayoutList className="w-5 h-5" /> },
        { id: 'graph',      label: 'Graph',                 icon: <Network className="w-5 h-5" /> },
        { id: 'study',      label: 'Study',                 icon: <BookOpen className="w-5 h-5" /> },
      ];

  const MobileLayout = (
    <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
      {activeTab === 'candidates' && (
        <div className="flex-1 overflow-y-auto bg-white py-2">
          {sorted.map((c) => (
            <CandidateCard key={c.id} candidate={c}
              selected={selected?.id === c.id}
              checked={checkedIds.has(c.id)}
              showCheckbox={mode === 'study'}
              onClick={() => { setSelected(c); setActiveTab(mode === 'source' ? 'profile' : 'candidates'); }}
              onCheck={() => toggleCheck(c.id)}
            />
          ))}
        </div>
      )}
      {activeTab === 'graph' && (
        <div className="flex-1 relative overflow-hidden">
          <TrustGraph company={company} candidates={candidates}
            selectedCandidateId={selected?.id} onSelectCandidate={handleSelect} />
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="flex-1 overflow-hidden bg-white">
          {selected ? <CandidateProfile candidate={selected} /> :
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8">
                <UserCircle className="w-8 h-8 text-[#DDD] mx-auto mb-2" />
                <p className="text-[13px] text-[#BBB]">Tap a candidate to see their profile</p>
                <button onClick={() => setActiveTab('candidates')}
                  className="mt-3 text-[12px] text-[#111] underline">Back to list</button>
              </div>
            </div>
          }
        </div>
      )}
      {activeTab === 'study' && (
        <div className="flex-1 overflow-hidden">
          <StudyView candidates={sorted} company={company} selectedIds={checkedIds} onToggle={toggleCheck} />
        </div>
      )}
      {/* Bottom tab bar */}
      <div className="flex border-t border-[#EBEBEB] bg-white shrink-0">
        {mobileTabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
              activeTab === t.id ? 'text-[#111]' : 'text-[#CCC]'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-white">
      <Header />
      {Toolbar}
      {DesktopLayout}
      {MobileLayout}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col">
        <div className="h-12 bg-white border-b border-[#EBEBEB]" />
        <div className="flex-1 flex items-center justify-center bg-[#0A0E1A]">
          <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <ExploreInner />
    </Suspense>
  );
}
