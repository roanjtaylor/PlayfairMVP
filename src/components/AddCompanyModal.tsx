'use client';
import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import type { PortfolioCompany, PortfolioFounder } from '@/lib/types';

interface Props {
  onClose: () => void;
  onAdd: (company: PortfolioCompany) => void;
}

const emptyFounder = (): PortfolioFounder => ({ name: '', role: '' });

export default function AddCompanyModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [githubOrg, setGithubOrg] = useState('');
  const [domains, setDomains] = useState('');
  const [founders, setFounders] = useState<PortfolioFounder[]>([emptyFounder()]);

  const updateFounder = (i: number, field: keyof PortfolioFounder, val: string) =>
    setFounders((prev) => prev.map((f, idx) => idx === i ? { ...f, [field]: val } : f));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const domain = website.replace(/^https?:\/\//, '').split('/')[0];
    const company: PortfolioCompany = {
      id: `custom-${slug}-${Date.now()}`,
      name: name.trim(),
      logoUrl: domain ? `https://logo.clearbit.com/${domain}` : undefined,
      sector: sector.trim(),
      description: description.trim(),
      founders: founders.filter((f) => f.name.trim()),
      githubOrg: githubOrg.trim() || undefined,
      domains: domains.split(',').map((d) => d.trim()).filter(Boolean),
      website: website.trim() || undefined,
      stage: 'Unknown',
      custom: true,
    };
    onAdd(company);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEBEB]">
          <h2 className="font-semibold text-[15px]">Add Company</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Company name *">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Inc" />
          </Field>
          <Field label="Website">
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="acme.com" />
          </Field>
          <Field label="Sector *">
            <input required value={sector} onChange={(e) => setSector(e.target.value)} placeholder="e.g. Enterprise SaaS" />
          </Field>
          <Field label="Description *">
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One sentence description" rows={2} />
          </Field>
          <Field label="GitHub org">
            <input value={githubOrg} onChange={(e) => setGithubOrg(e.target.value)} placeholder="e.g. acme-corp" />
          </Field>
          <Field label="Domain keywords (comma-separated)">
            <input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="e.g. saas, payments, api" />
          </Field>

          <div>
            <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider block mb-2">Founders</label>
            <div className="space-y-2">
              {founders.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 text-[13px] px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#111] placeholder:text-[#CCC]"
                    placeholder="Name"
                    value={f.name}
                    onChange={(e) => updateFounder(i, 'name', e.target.value)}
                  />
                  <input
                    className="w-24 text-[13px] px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#111] placeholder:text-[#CCC]"
                    placeholder="Role"
                    value={f.role}
                    onChange={(e) => updateFounder(i, 'role', e.target.value)}
                  />
                  {i > 0 && (
                    <button type="button" onClick={() => setFounders((prev) => prev.filter((_, idx) => idx !== i))}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#EBEBEB] hover:bg-[#F5F5F5] transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {founders.length < 4 && (
                <button type="button" onClick={() => setFounders((prev) => [...prev, emptyFounder()])}
                  className="flex items-center gap-1.5 text-[12px] text-[#999] hover:text-[#111] transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add founder
                </button>
              )}
            </div>
          </div>

          <button type="submit" className="w-full py-2.5 bg-[#111] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors mt-2">
            Add to Portfolio
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#999] uppercase tracking-wider block mb-1.5">{label}</label>
      {children.type === 'textarea'
        ? <textarea {...(children.props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className="w-full text-[13px] px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#111] placeholder:text-[#CCC] resize-none" />
        : <input {...(children.props as React.InputHTMLAttributes<HTMLInputElement>)}
            className="w-full text-[13px] px-3 py-2 border border-[#EBEBEB] rounded-lg focus:outline-none focus:border-[#111] placeholder:text-[#CCC]" />
      }
    </div>
  );
}
