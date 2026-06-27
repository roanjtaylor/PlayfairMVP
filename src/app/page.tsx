'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';
import Header from '@/components/Header';
import PortfolioCard from '@/components/PortfolioCard';
import DiscoverySources from '@/components/DiscoverySources';
import { portfolio } from '@/data/portfolio';

export default function HomePage() {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>(['github', 'academic']);
  const [depth, setDepth] = useState<1 | 2>(1);
  const [location, setLocation] = useState('UK');

  const handleExpand = () => {
    if (!selectedCompany) return;
    const params = new URLSearchParams({
      company: selectedCompany,
      sources: sources.join(','),
      depth: String(depth),
      location,
    });
    router.push(`/explore?${params}`);
  };

  const company = portfolio.find((c) => c.id === selectedCompany);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      {/* Hero */}
      <div className="bg-[#0A0E1A] border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
                  Internal Tool
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">
                Expand the Playfair<br />
                <span className="text-playfair-blue-light">Trust Network</span>
              </h1>
              <p className="mt-3 text-[#64748B] max-w-lg leading-relaxed">
                Select a portfolio company to discover exceptional people one or two hops away — future founders
                connected to founders you already trust.
              </p>
            </div>
            <div className="hidden lg:flex flex-col gap-2 text-right">
              {[
                { label: 'Data Sources', value: '3 active' },
                { label: 'Portfolio Companies', value: `${portfolio.length} loaded` },
                { label: 'AI Model', value: 'Claude' },
              ].map(({ label, value }) => (
                <div key={label} className="text-right">
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider">{label}</div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Portfolio + Sources */}
          <div className="lg:col-span-2 space-y-8">

            {/* Portfolio grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Portfolio Companies
                </h2>
                {selectedCompany && (
                  <span className="text-xs text-[#2563EB] font-medium">
                    {company?.name} selected
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {portfolio.map((co) => (
                  <PortfolioCard
                    key={co.id}
                    company={co}
                    selected={selectedCompany === co.id}
                    onClick={() =>
                      setSelectedCompany(selectedCompany === co.id ? null : co.id)
                    }
                  />
                ))}
              </div>
            </div>

            {/* Discovery sources */}
            <DiscoverySources sources={sources} onChange={setSources} />
          </div>

          {/* Right: Controls + CTA */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-5">
              <div>
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Relationship Depth
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {([1, 2] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDepth(d)}
                      className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                        depth === d
                          ? 'bg-[#0F172A] text-white shadow-sm'
                          : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'
                      }`}
                    >
                      {d === 1 ? 'One Hop' : 'Two Hops'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                  Location
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {['UK', 'Europe', 'Global'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all ${
                        location === loc
                          ? 'bg-[#0F172A] text-white'
                          : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleExpand}
                  disabled={!selectedCompany || sources.length === 0}
                  className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 ${
                    selectedCompany && sources.length > 0
                      ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200'
                      : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Expand Network
                  {selectedCompany && sources.length > 0 && (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>

                {!selectedCompany && (
                  <p className="text-xs text-center text-[#94A3B8] mt-2">
                    Select a portfolio company above
                  </p>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
              <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
                How It Works
              </h3>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'Select a portfolio company as the trust graph seed' },
                  { step: '2', text: 'GitHub + Academic APIs surface adjacent technical people' },
                  { step: '3', text: 'Claude synthesises candidates and explains each connection' },
                  { step: '4', text: 'Explore the trust graph and investigate promising profiles' },
                ].map(({ step, text }) => (
                  <li key={step} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {step}
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[10px] text-[#94A3B8] text-center leading-relaxed px-2">
              Uses GitHub API, OpenAlex, and Claude to expand Playfair's proprietary trust graph.
              LinkedIn links open a pre-filled search — no scraping required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
