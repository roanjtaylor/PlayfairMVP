'use client';
import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type NodeTypes,
  type Node,
  type Edge,
  type NodeProps,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { SavedExpansion, Candidate } from '@/lib/types';

const NODE_COLORS: Record<string, string> = {
  playfair:   '#7B7FD4',
  company:    '#4F52A8',
  founder:    '#059669',
  connection: '#7C3AED',
  candidate:  '#D97706',
};

type NodeData = {
  label: string;
  nodeType: keyof typeof NODE_COLORS;
  photo?: string | null;
  sublabel?: string;
};

function TrustNode({ data, selected }: NodeProps & { data: NodeData }) {
  const color = NODE_COLORS[data.nodeType] ?? '#64748B';
  const initials = data.label
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex flex-col items-center" style={{ minWidth: 120 }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-full text-white text-xs font-semibold shadow-lg transition-all duration-200"
        style={{
          backgroundColor: color,
          border: selected ? '2px solid #FFFFFF' : '2px solid rgba(255,255,255,0.15)',
          boxShadow: selected
            ? `0 0 0 3px ${color}40, 0 4px 20px ${color}60`
            : '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        {data.photo ? (
          <img src={data.photo} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-[9px] font-bold shrink-0">
            {initials}
          </div>
        )}
        <span className="max-w-[110px] truncate">{data.label}</span>
      </div>
      {data.sublabel && (
        <span className="mt-1 text-[9px] text-white/50 font-medium truncate max-w-[140px]">
          {data.sublabel}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { trust: TrustNode as never };

interface Props {
  expansions: SavedExpansion[];
  selectedCandidateId?: string;
  onSelectCandidate: (c: Candidate) => void;
}

function buildGraph(expansions: SavedExpansion[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const COMPANY_SPAN = 300; // horizontal space per company
  const totalW = Math.max(expansions.length * COMPANY_SPAN, 600);

  // Root
  nodes.push({
    id: 'playfair',
    type: 'trust',
    position: { x: totalW / 2 - 60, y: 0 },
    data: { label: 'Playfair Capital', nodeType: 'playfair' } as NodeData,
  });

  expansions.forEach((exp, coIdx) => {
    const centerX = (totalW / (expansions.length + 1)) * (coIdx + 1);
    const coId = `co-${exp.company.id}`;

    // Company
    nodes.push({
      id: coId,
      type: 'trust',
      position: { x: centerX - 60, y: 120 },
      data: { label: exp.company.name, nodeType: 'company', sublabel: exp.company.sector } as NodeData,
    });
    edges.push({
      id: `e-pf-${coId}`,
      source: 'playfair',
      target: coId,
      animated: true,
      label: 'invested in',
      labelStyle: { fill: '#8888AA', fontSize: 9 },
      labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
      style: { stroke: NODE_COLORS.playfair, strokeWidth: 2 },
    });

    // Founders
    const founders = exp.company.founders;
    founders.forEach((f, fIdx) => {
      const spread = (founders.length - 1) * 160;
      const fX = centerX - spread / 2 + fIdx * 160 - 60;
      const fId = `f-${exp.company.id}-${fIdx}`;
      nodes.push({
        id: fId,
        type: 'trust',
        position: { x: fX, y: 250 },
        data: { label: f.name, nodeType: 'founder', sublabel: f.role } as NodeData,
      });
      edges.push({
        id: `e-co-${fId}`,
        source: coId,
        target: fId,
        animated: true,
        style: { stroke: NODE_COLORS.founder, strokeWidth: 1.5 },
      });
    });

    // Candidates — cap at 6 per company to keep graph readable
    const cands = exp.candidates.slice(0, 6);
    const fCount = founders.length;
    cands.forEach((c, cIdx) => {
      const spread = (cands.length - 1) * 155;
      const cX = centerX - spread / 2 + cIdx * 155 - 60;
      const isOneHop = c.relationshipDistance === 1;
      const y = isOneHop ? 390 : 510;

      nodes.push({
        id: c.id,
        type: 'trust',
        position: { x: cX, y },
        data: {
          label: c.name,
          nodeType: isOneHop ? 'connection' : 'candidate',
          sublabel: c.technicalArea,
          photo: c.photo ?? null,
        } as NodeData,
      });

      edges.push({
        id: `e-cand-${c.id}`,
        source: `f-${exp.company.id}-${cIdx % fCount}`,
        target: c.id,
        animated: true,
        label: (c.connectionPath[2] ?? '').slice(0, 22) || undefined,
        labelStyle: { fill: '#6B7280', fontSize: 8 },
        labelBgStyle: { fill: '#0F172A', fillOpacity: 0.7 },
        style: {
          stroke: isOneHop ? NODE_COLORS.connection : NODE_COLORS.candidate,
          strokeWidth: 1.5,
          strokeDasharray: isOneHop ? undefined : '4 2',
        },
      });
    });
  });

  return { nodes, edges };
}

export default function StudyGraph({ expansions, selectedCandidateId, onSelectCandidate }: Props) {
  const allCandidates = useMemo(
    () => expansions.flatMap((e) => e.candidates),
    [expansions]
  );

  const { nodes, edges } = useMemo(() => buildGraph(expansions), [expansions]);

  const styledNodes = useMemo(
    () => nodes.map((n) => ({ ...n, selected: n.id === selectedCandidateId })),
    [nodes, selectedCandidateId]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const c = allCandidates.find((x) => x.id === node.id);
      if (c) onSelectCandidate(c);
    },
    [allCandidates, onSelectCandidate]
  );

  return (
    <div className="w-full h-full bg-[#0A0E1A] overflow-hidden relative">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background color="#1E293B" gap={24} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => NODE_COLORS[(n.data as NodeData)?.nodeType] ?? '#64748B'}
          maskColor="rgba(10,14,26,0.7)"
          style={{ background: '#1E293B' }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-16 left-3 flex flex-col gap-1.5 pointer-events-none">
        {[
          { color: NODE_COLORS.playfair,   label: 'Playfair' },
          { color: NODE_COLORS.company,    label: 'Portfolio Co' },
          { color: NODE_COLORS.founder,    label: 'Founder' },
          { color: NODE_COLORS.connection, label: '1 Hop' },
          { color: NODE_COLORS.candidate,  label: '2 Hops' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-white/50 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
