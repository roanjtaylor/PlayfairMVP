'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import PortfolioCard from '@/components/PortfolioCard';
import DiscoverySources from '@/components/DiscoverySources';
import AddCompanyModal from '@/components/AddCompanyModal';
import { portfolio as staticPortfolio } from '@/data/portfolio';
import { useCustomPortfolio } from '@/hooks/useCustomPortfolio';
import type { PortfolioCompany } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { customCompanies, addCompany, removeCompany, loaded } = useCustomPortfolio();

  const allCompanies: PortfolioCompany[] = loaded
    ? [...staticPortfolio, ...customCompanies]
    : staticPortfolio;

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
    // Pass company as JSON for custom companies; use id for static ones
    if (selected.custom) {
      params.set('companyData', JSON.stringify(selected));
    } else {
      params.set('company', selected.id);
    }
    router.push(`/explore?${params}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-screen-lg mx-auto px-5 py-10">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-[22px] font-bold text-[#111]">Trust Graph Explorer</h1>
          <p className="text-[14px] text-[#999] mt-1">
            Select a portfolio company, choose your sources, and discover future founders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left + Centre: Portfolio */}
          <div className="lg:col-span-2 space-y-6">

            {/* Portfolio */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#BBB] uppercase tracking-widest">
                  Portfolio — {allCompanies.length} companies
                </span>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 text-[12px] text-[#999] hover:text-[#111] transition-colors font-medium"
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

            {/* Sources */}
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
                      depth === d ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-[#666] border-[#EBEBEB] hover:border-[#AAA]'
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
                      location === loc ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-[#666] border-[#EBEBEB] hover:border-[#AAA]'
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
                    ? 'bg-[#111] text-white hover:bg-[#333]'
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

      {showAddModal && (
        <AddCompanyModal onClose={() => setShowAddModal(false)} onAdd={addCompany} />
      )}
    </div>
  );
}
