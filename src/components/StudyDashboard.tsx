'use client';
import { useState, useMemo } from 'react';
import { Users, Loader2, BookOpen, Cloud } from 'lucide-react';
import { useDiscoveries } from '@/hooks/useDiscoveries';
import CandidateCard from './CandidateCard';
import CandidateProfile from './CandidateProfile';
import StudyView from './StudyView';
import type { Candidate, PortfolioCompany } from '@/lib/types';

export default function StudyDashboard() {
  const { store, loading, saving } = useDiscoveries();
  const [filterCompanyId, setFilterCompanyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [showStudy, setShowStudy] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'profile'>('list');

  const companies = useMemo(
    () => store.expansions.map((e) => e.company),
    [store]
  );

  const candidates: Candidate[] = useMemo(() => {
    const seen = new Set<string>();
    const out: Candidate[] = [];
    const expansions = filterCompanyId
      ? store.expansions.filter((e) => e.company.id === filterCompanyId)
      : store.expansions;
    for (const exp of expansions) {
      for (const c of exp.candidates) {
        if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
      }
    }
    return out.sort((a, b) => b.founderReadiness - a.founderReadiness);
  }, [store, filterCompanyId]);

  const studyCompany: PortfolioCompany | undefined = useMemo(() => {
    if (filterCompanyId) return companies.find((c) => c.id === filterCompanyId);
    if (selected) {
      for (const exp of store.expansions) {
        if (exp.candidates.some((c) => c.id === selected.id)) return exp.company;
      }
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-5 h-5 animate-spin text-[#7B7FD4]" />
    </div>
  );

  if (store.expansions.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
      <Users className="w-10 h-10 text-[#E0E0E0] mb-4" />
      <p className="text-[14px] font-semibold text-[#888]">No discoveries yet</p>
      <p className="text-[13px] text-[#BBB] mt-1 max-w-xs">
        Switch to Source, expand a portfolio company, and candidates will appear here.
      </p>
    </div>
  );

  // ── Desktop ──────────────────────────────────────────────────────────
  const DesktopLayout = (
    <div className="hidden lg:flex flex-1 overflow-hidden">
      {/* Left: filters + list */}
      <div className="w-64 shrink-0 border-r border-[#EAEAF5] flex flex-col overflow-hidden bg-white">
        {/* Company filter chips */}
        <div className="px-3 pt-2.5 pb-2 border-b border-[#F0F0F0] flex flex-wrap gap-1.5">
          <button onClick={() => setFilterCompanyId(null)}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              !filterCompanyId ? 'bg-[#7B7FD4] text-white' : 'bg-[#F5F5F5] text-[#888] hover:bg-[#EAEAF5]'
            }`}>All</button>
          {companies.map((c) => (
            <button key={c.id} onClick={() => setFilterCompanyId(c.id === filterCompanyId ? null : c.id)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                filterCompanyId === c.id ? 'bg-[#7B7FD4] text-white' : 'bg-[#F5F5F5] text-[#888] hover:bg-[#EAEAF5]'
              }`}>{c.name}</button>
          ))}
        </div>

        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#F0F0F0]">
          <span className="text-[10px] font-semibold text-[#BBB] uppercase tracking-widest">
            {candidates.length} people
          </span>
          {saving && <Cloud className="w-3 h-3 text-[#7B7FD4] animate-pulse" />}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {candidates.map((c) => (
            <CandidateCard key={c.id} candidate={c}
              selected={selected?.id === c.id}
              checked={checkedIds.has(c.id)}
              showCheckbox
              onClick={() => { setSelected(c); setShowStudy(false); }}
              onCheck={() => toggleCheck(c.id)}
            />
          ))}
        </div>

        {checkedIds.size > 0 && (
          <div className="p-3 border-t border-[#EAEAF5]">
            <button onClick={() => setShowStudy(true)}
              className="w-full py-2 bg-[#7B7FD4] text-white text-[12px] font-semibold rounded-lg hover:bg-[#6366C0] transition-colors flex items-center justify-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Study {checkedIds.size} selected
            </button>
          </div>
        )}
      </div>

      {/* Right: profile or study */}
      <div className="flex-1 overflow-hidden bg-white">
        {showStudy && studyCompany ? (
          <StudyView candidates={candidates} company={studyCompany} selectedIds={checkedIds} onToggle={toggleCheck} />
        ) : selected ? (
          <CandidateProfile candidate={selected} />
        ) : (
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <Users className="w-8 h-8 text-[#E0E0E0] mx-auto mb-3" />
              <p className="text-[13px] text-[#BBB]">Select a candidate to view their profile</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Mobile ───────────────────────────────────────────────────────────
  const MobileLayout = (
    <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
      {mobileView === 'list' ? (
        <>
          {/* Company filter chips */}
          <div className="px-3 pt-2.5 pb-2 border-b border-[#F0F0F0] flex flex-wrap gap-1.5 bg-white shrink-0">
            <button onClick={() => setFilterCompanyId(null)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                !filterCompanyId ? 'bg-[#7B7FD4] text-white' : 'bg-[#F5F5F5] text-[#888]'
              }`}>All</button>
            {companies.map((c) => (
              <button key={c.id} onClick={() => setFilterCompanyId(c.id === filterCompanyId ? null : c.id)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                  filterCompanyId === c.id ? 'bg-[#7B7FD4] text-white' : 'bg-[#F5F5F5] text-[#888]'
                }`}>{c.name}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto bg-white py-2">
            {candidates.map((c) => (
              <CandidateCard key={c.id} candidate={c}
                selected={selected?.id === c.id}
                checked={checkedIds.has(c.id)}
                showCheckbox
                onClick={() => { setSelected(c); setShowStudy(false); setMobileView('profile'); }}
                onCheck={() => toggleCheck(c.id)}
              />
            ))}
          </div>
          {checkedIds.size > 0 && (
            <div className="p-3 border-t border-[#EAEAF5] bg-white shrink-0">
              <button onClick={() => { setShowStudy(true); setMobileView('profile'); }}
                className="w-full py-2.5 bg-[#7B7FD4] text-white text-[13px] font-semibold rounded-xl flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Study {checkedIds.size} selected
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <button onClick={() => setMobileView('list')}
            className="px-4 py-3 border-b border-[#EAEAF5] text-[12px] text-[#7B7FD4] font-medium text-left shrink-0">
            ← Back to list
          </button>
          <div className="flex-1 overflow-hidden">
            {showStudy && studyCompany ? (
              <StudyView candidates={candidates} company={studyCompany} selectedIds={checkedIds} onToggle={toggleCheck} />
            ) : selected ? (
              <CandidateProfile candidate={selected} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {DesktopLayout}
      {MobileLayout}
    </>
  );
}
