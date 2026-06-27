'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Users, Loader2, BookOpen, Cloud,
  LayoutList, Network, UserCircle,
} from 'lucide-react';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import CandidateCard from './CandidateCard';
import CandidateProfile from './CandidateProfile';
import StudyView from './StudyView';
import type { Candidate, PortfolioCompany } from '@/lib/types';

const StudyGraph = dynamic(() => import('./StudyGraph'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0A0E1A] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#7B7FD4] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type MobileTab = 'list' | 'network' | 'profile';
type RightPanel = 'profile' | 'study';

export default function StudyDashboard() {
  const { store, loading, saving } = useDiscoveries();

  const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);
  const [selected, setSelected]               = useState<Candidate | null>(null);
  const [checkedIds, setCheckedIds]           = useState<Set<string>>(new Set());
  const [rightPanel, setRightPanel]           = useState<RightPanel>('profile');
  const [mobileTab, setMobileTab]             = useState<MobileTab>('list');

  const companies = useMemo(() => store.expansions.map((e) => e.company), [store]);

  const activeExpansions = useMemo(
    () => filterCompanyId
      ? store.expansions.filter((e) => e.company.id === filterCompanyId)
      : store.expansions,
    [store, filterCompanyId]
  );

  const candidates: Candidate[] = useMemo(() => {
    const seen = new Set<string>();
    const out: Candidate[] = [];
    for (const exp of activeExpansions) {
      for (const c of exp.candidates) {
        if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
      }
    }
    return out.sort((a, b) => b.founderReadiness - a.founderReadiness);
  }, [activeExpansions]);

  const studyCompany: PortfolioCompany | undefined = useMemo(() => {
    if (filterCompanyId) return companies.find((c) => c.id === filterCompanyId);
    if (selected) {
      for (const exp of store.expansions)
        if (exp.candidates.some((c) => c.id === selected.id)) return exp.company;
    }
    return store.expansions[0]?.company;
  }, [filterCompanyId, selected, companies, store]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectCandidate = (c: Candidate) => {
    setSelected(c);
    setRightPanel('profile');
    setMobileTab('profile');
  };

  const handleStudy = () => {
    setRightPanel('study');
    setMobileTab('profile'); // mobile: show in profile slot
  };

  // ── Empty / Loading states ───────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-[#7B7FD4]" />
    </div>
  );

  if (store.expansions.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
      <Network className="w-10 h-10 text-[#E0E0E0] mb-4" />
      <p className="text-[14px] font-semibold text-[#888]">No discoveries yet</p>
      <p className="text-[13px] text-[#BBB] mt-1 max-w-xs">
        Switch to Source, expand a portfolio company, and candidates will appear here.
      </p>
    </div>
  );

  // ── Shared: company filter chips ─────────────────────────────────────
  const FilterChips = (
    <div className="px-3 pt-2.5 pb-2 border-b border-[#F0F0F0] flex flex-wrap gap-1.5 shrink-0">
      <button
        onClick={() => setFilterCompanyId(null)}
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
          !filterCompanyId ? 'bg-[#7B7FD4] text-white' : 'bg-[#F5F5F5] text-[#888] hover:bg-[#EAEAF5]'
        }`}
      >All</button>
      {companies.map((c) => (
        <button key={c.id}
          onClick={() => setFilterCompanyId(c.id === filterCompanyId ? null : c.id)}
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
            filterCompanyId === c.id
              ? 'bg-[#7B7FD4] text-white'
              : 'bg-[#F5F5F5] text-[#888] hover:bg-[#EAEAF5]'
          }`}
        >{c.name}</button>
      ))}
    </div>
  );

  // ── Shared: candidate list ───────────────────────────────────────────
  const CandidateList = (onTap?: () => void) => (
    <div className="flex-1 overflow-y-auto py-2">
      {candidates.map((c) => (
        <CandidateCard key={c.id} candidate={c}
          selected={selected?.id === c.id}
          checked={checkedIds.has(c.id)}
          showCheckbox
          onClick={() => { handleSelectCandidate(c); onTap?.(); }}
          onCheck={() => toggleCheck(c.id)}
        />
      ))}
    </div>
  );

  // ── Shared: study action ─────────────────────────────────────────────
  const StudyAction = (
    <div className="p-3 border-t border-[#EAEAF5] shrink-0">
      <button
        onClick={handleStudy}
        disabled={checkedIds.size === 0}
        className={`w-full py-2 text-[12px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
          checkedIds.size > 0
            ? 'bg-[#7B7FD4] text-white hover:bg-[#6366C0]'
            : 'bg-[#F5F5F5] text-[#CCC] cursor-not-allowed'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        {checkedIds.size > 0 ? `Study ${checkedIds.size} selected` : 'Select candidates to study'}
      </button>
    </div>
  );

  // ── Shared: right panel content ──────────────────────────────────────
  const RightContent = (
    <div className="flex-1 overflow-hidden bg-white flex flex-col">
      {rightPanel === 'study' && studyCompany ? (
        <StudyView
          candidates={candidates}
          company={studyCompany}
          selectedIds={checkedIds}
          onToggle={toggleCheck}
        />
      ) : selected ? (
        <CandidateProfile candidate={selected} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <UserCircle className="w-8 h-8 text-[#E0E0E0] mx-auto mb-3" />
            <p className="text-[13px] text-[#BBB]">Select a candidate to view their profile</p>
          </div>
        </div>
      )}
    </div>
  );

  // ── Desktop: 3-panel layout ──────────────────────────────────────────
  const DesktopLayout = (
    <div className="hidden lg:flex flex-1 overflow-hidden">
      {/* Left: list */}
      <div className="w-60 shrink-0 border-r border-[#EAEAF5] flex flex-col overflow-hidden bg-white">
        {FilterChips}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#F0F0F0]">
          <span className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">
            {candidates.length} people
          </span>
          {saving && <Cloud className="w-3 h-3 text-[#7B7FD4] animate-pulse" aria-label="Saving to GitHub" />}
        </div>
        {CandidateList()}
        {StudyAction}
      </div>

      {/* Centre: graph */}
      <div className="flex-1 relative overflow-hidden">
        <StudyGraph
          expansions={activeExpansions}
          selectedCandidateId={selected?.id}
          onSelectCandidate={handleSelectCandidate}
        />
      </div>

      {/* Right: profile or study reports */}
      <div className="w-80 shrink-0 border-l border-[#EAEAF5] overflow-hidden flex flex-col">
        {RightContent}
      </div>
    </div>
  );

  // ── Mobile tabs ──────────────────────────────────────────────────────
  const mobileTabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'list',    label: `${candidates.length}`, icon: <LayoutList className="w-5 h-5" /> },
    { id: 'network', label: 'Network',               icon: <Network className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile',               icon: <UserCircle className="w-5 h-5" /> },
  ];

  const MobileLayout = (
    <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
      {mobileTab === 'list' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {FilterChips}
          {CandidateList(() => setMobileTab('profile'))}
          {StudyAction}
        </div>
      )}

      {mobileTab === 'network' && (
        <div className="flex-1 relative overflow-hidden">
          <StudyGraph
            expansions={activeExpansions}
            selectedCandidateId={selected?.id}
            onSelectCandidate={(c) => { handleSelectCandidate(c); setMobileTab('profile'); }}
          />
        </div>
      )}

      {mobileTab === 'profile' && (
        <div className="flex-1 overflow-hidden bg-white flex flex-col">
          {RightContent}
        </div>
      )}

      {/* Bottom tab bar */}
      <div className="flex border-t border-[#EAEAF5] bg-white shrink-0">
        {mobileTabs.map((t) => (
          <button key={t.id} onClick={() => setMobileTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
              mobileTab === t.id ? 'text-[#7B7FD4]' : 'text-[#CCC]'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {DesktopLayout}
      {MobileLayout}
    </>
  );
}
