'use client';
import clsx from 'clsx';

const SOURCES = [
  { id: 'github',   label: 'GitHub',   sub: 'OSS contributors & collaborators' },
  { id: 'academic', label: 'Academic', sub: 'OpenAlex research network' },
  { id: 'web',      label: 'Web',      sub: 'Talks, blogs, conferences' },
] as const;

interface Props {
  sources: string[];
  onChange: (sources: string[]) => void;
}

export default function DiscoverySources({ sources, onChange }: Props) {
  const toggle = (id: string) =>
    onChange(sources.includes(id) ? sources.filter((s) => s !== id) : [...sources, id]);

  return (
    <div className="flex flex-col gap-1.5">
      {SOURCES.map(({ id, label, sub }) => {
        const active = sources.includes(id);
        return (
          <button
            key={id}
            onClick={() => toggle(id)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all',
              active ? 'border-[#111] bg-[#111] text-white' : 'border-[#EBEBEB] bg-white text-[#111] hover:border-[#AAA]'
            )}
          >
            <div className={clsx('w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center',
              active ? 'bg-white border-white' : 'border-[#CCC]'
            )}>
              {active && <div className="w-2 h-2 rounded-sm bg-[#111]" />}
            </div>
            <span className="text-[13px] font-medium">{label}</span>
            <span className={clsx('text-[11px] ml-auto', active ? 'text-[#888]' : 'text-[#BBB]')}>{sub}</span>
          </button>
        );
      })}
    </div>
  );
}
