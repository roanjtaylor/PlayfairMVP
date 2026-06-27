'use client';
import { Github, BookOpen, Globe } from 'lucide-react';
import clsx from 'clsx';

interface Source {
  id: 'github' | 'academic' | 'web';
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const SOURCES: Source[] = [
  {
    id: 'github',
    label: 'GitHub',
    description: 'OSS collaborators, contributors, maintainers, repo overlap',
    icon: <Github className="w-4 h-4" />,
    color: '#0F172A',
  },
  {
    id: 'academic',
    label: 'Academic',
    description: 'OpenAlex · research groups · Cambridge · Oxford · Imperial',
    icon: <BookOpen className="w-4 h-4" />,
    color: '#7C3AED',
  },
  {
    id: 'web',
    label: 'Public Web',
    description: 'Conference speakers, technical blogs, podcasts, engineering talks',
    icon: <Globe className="w-4 h-4" />,
    color: '#0891B2',
  },
];

interface Props {
  sources: string[];
  onChange: (sources: string[]) => void;
}

export default function DiscoverySources({ sources, onChange }: Props) {
  const toggle = (id: string) => {
    onChange(sources.includes(id) ? sources.filter((s) => s !== id) : [...sources, id]);
  };

  return (
    <div>
      <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
        Discovery Sources
      </h2>
      <div className="grid grid-cols-1 gap-2.5">
        {SOURCES.map((source) => {
          const active = sources.includes(source.id);
          return (
            <button
              key={source.id}
              onClick={() => toggle(source.id)}
              className={clsx(
                'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150',
                active
                  ? 'border-transparent bg-[#0F172A] text-white shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
              )}
            >
              <div
                className={clsx(
                  'mt-0.5 p-1.5 rounded-md shrink-0',
                  active ? 'bg-white/15 text-white' : 'text-[#64748B] bg-[#F1F5F9]'
                )}
              >
                {source.icon}
              </div>
              <div>
                <div className={clsx('text-sm font-semibold', active ? 'text-white' : 'text-[#0F172A]')}>
                  {source.label}
                </div>
                <div className={clsx('text-xs mt-0.5', active ? 'text-white/60' : 'text-[#94A3B8]')}>
                  {source.description}
                </div>
              </div>
              <div className="ml-auto shrink-0 mt-0.5">
                <div
                  className={clsx(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all',
                    active ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#CBD5E1]'
                  )}
                >
                  {active && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
