'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, Network, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import PortfolioCard from '@/components/PortfolioCard';
import DiscoverySources from '@/components/DiscoverySources';
import AddCompanyModal from '@/components/AddCompanyModal';
import StudyDashboard from '@/components/StudyDashboard';
import { portfolio as staticPortfolio } from '@/data/portfolio';
import { useCustomPortfolio } from '@/hooks/useCustomPortfolio';
import type { PortfolioCompany } from '@/lib/types';

type Tab = 'source' | 'study';

export default function HomePage() {
  const router = useRouter();
  const { customCompanies, addCompany, removeCompany, loaded } = useCustomPortfolio();

  const allCompanies: PortfolioCompany[] = loaded
    ? [...staticPortfolio, ...customCompanies]
    : staticPortfolio;

  const [tab, setTab] = useState<Tab>('source');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>(['github', 'academic']);
  const [depth, setDepth] = useState<1 | 2>(1);
  const [location, setLocation] = useState('UK');
  const [showAddModal, setShowAddModal] = useState(false);

  const selected = allCompanies.find((c) => c.id === selectedId);

  const handleExpand = () => {
    if (!selected) return;
    const params = new URLSearchParams({
      sources: sources.join(','),
      depth: String(depth),
      location,
    });
    if (selected.custom) {
      params.set('companyData', JSON.stringify(selected));
    } else {
      params.set('company', selected.id);
    }
    router.push(`/explore?${params}`);
  };

  return (
    <div className={`bg-white ${tab === 'study' ? 'h-[100dvh] flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <Header />

      {/* Tab bar */}
      <div className="border-b border-[#EAEAF5] bg-white shrink-0">
        <div className="max-w-screen-lg mx-auto px-5 flex items-center gap-1 pt-2">
          {([
            { id: 'source', label: 'Source', icon: <Network className="w-3.5 h-3.5" /> },
            { id: 'study',  label: 'Study',  icon: <BookOpen className="w-3.5 h-3.5" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold border-b-2 transition-all -mb-px ${
                tab === t.id
                  ? 'border-[#7B7FD4] text-[#7B7FD4]'
                  : 'border-transparent text-[#BBB] hover:text-[#888]'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Source tab ── */}
      {tab === 'source' && (
        <>
          <div className="bg-[#F5F5FC] border-b border-[#EAEAF5] px-5 py-6">
            <div className="max-w-screen-lg mx-auto">
              <h1 className="text-[20px] font-bold text-[#111]">Trust Graph Explorer</h1>
              <p className="text-[13px] text-[#888] mt-1">
                Select a portfolio company, choose your sources, and discover future founders.
              </p>
            </div>
          </div>

          <div className="max-w-screen-lg mx-auto px-5 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left + Centre: Portfolio */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold text-[#BBB] uppercase tracking-widest">
                      Portfolio — {allCompanies.length} companies
                    </span>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1 text-[12px] text-[#999] hover:text-[#7B7FD4] transition-colors font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add company
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allCompanies.map((co) => (
                      <PortfolioCard
                        key={co.id}
                        company={co}
                        selected={selectedId === co.id}
                        onClick={() => setSelectedId(selectedId === co.id ? null : co.id)}
                        onRemove={co.custom ? () => removeCompany(co.id) : undefined}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#BBB] uppercase tracking-widest block mb-3">
                    Discovery Sources
                  </span>
                  <DiscoverySources sources={sources} onChange={setSources} />
                </div>
              </div>

              {/* Right: Controls */}
              <div className="space-y-5">
                <div>
                  <span className="text-[11px] font-semibold text-[#BBB] uppercase tracking-widest block mb-3">
                    Depth
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {([1, 2] as const).map((d) => (
                      <button key={d} onClick={() => setDepth(d)}
                        className={`py-2 text-[13px] font-medium rounded-lg border transition-all ${
                          depth === d ? 'bg-[#7B7FD4] text-white border-[#7B7FD4]' : 'bg-white text-[#666] border-[#EBEBEB] hover:border-[#7B7FD4]'
                        }`}>
                        {d === 1 ? 'One hop' : 'Two hops'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-[#BBB] uppercase tracking-widest block mb-3">
                    Location
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {['UK', 'Europe', 'Global'].map((loc) => (
                      <button key={loc} onClick={() => setLocation(loc)}
                        className={`py-2 text-[12px] font-medium rounded-lg border transition-all ${
                          location === loc ? 'bg-[#7B7FD4] text-white border-[#7B7FD4]' : 'bg-white text-[#666] border-[#EBEBEB] hover:border-[#7B7FD4]'
                        }`}>
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExpand}
                    disabled={!selected || !sources.length}
                    className={`w-full py-3 flex items-center justify-center gap-2 text-[14px] font-semibold rounded-xl transition-all ${
                      selected && sources.length
                        ? 'bg-[#7B7FD4] text-white hover:bg-[#6366C0]'
                        : 'bg-[#F5F5F5] text-[#BBB] cursor-not-allowed'
                    }`}
                  >
                    {selected ? `Expand ${selected.name}` : 'Select a company'}
                    {selected && sources.length > 0 && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>

                {selected && (
                  <div className="pt-2 text-[12px] text-[#BBB] space-y-1">
                    <p className="font-medium text-[#999]">{selected.name}</p>
                    {selected.founders.map((f) => (
                      <p key={f.name}>{f.name}, {f.role}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Study tab ── */}
      {tab === 'study' && <StudyDashboard />}

      {showAddModal && (
        <AddCompanyModal onClose={() => setShowAddModal(false)} onAdd={addCompany} />
      )}
    </div>
  );
}
