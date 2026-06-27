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
import type { PortfolioCompany, Candidate } from '@/lib/types';

const NODE_COLORS: Record<string, string> = {
  playfair: '#2563EB',
  company: '#1E40AF',
  founder: '#059669',
  connection: '#7C3AED',
  candidate: '#D97706',
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
    <div
      className="relative flex flex-col items-center"
      style={{ minWidth: 120 }}
    >
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
        <span className="mt-1 text-[9px] text-white/50 font-medium">{data.sublabel}</span>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { trust: TrustNode as any };

interface Props {
  company: PortfolioCompany;
  candidates: Candidate[];
  selectedCandidateId?: string;
  onSelectCandidate: (candidate: Candidate) => void;
}

function layoutNodes(company: PortfolioCompany, candidates: Candidate[]) {
  const W = 900;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Root: Playfair
  nodes.push({
    id: 'playfair',
    type: 'trust',
    position: { x: W / 2 - 60, y: 20 },
    data: { label: 'Playfair Capital', nodeType: 'playfair' } as NodeData,
  });

  // Company
  nodes.push({
    id: 'company',
    type: 'trust',
    position: { x: W / 2 - 60, y: 110 },
    data: { label: company.name, nodeType: 'company', sublabel: company.sector } as NodeData,
  });

  edges.push({
    id: 'e-pf-co',
    source: 'playfair',
    target: 'company',
    animated: true,
    label: 'invested in',
    labelStyle: { fill: '#475569', fontSize: 9 },
    labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
    style: { stroke: '#2563EB', strokeWidth: 2 },
  });

  // Founders
  const founderCount = company.founders.length;
  company.founders.forEach((founder, i) => {
    const x = (W / (founderCount + 1)) * (i + 1) - 60;
    const id = `founder-${i}`;
    nodes.push({
      id,
      type: 'trust',
      position: { x, y: 220 },
      data: { label: founder.name, nodeType: 'founder', sublabel: founder.role } as NodeData,
    });
    edges.push({
      id: `e-co-f${i}`,
      source: 'company',
      target: id,
      animated: true,
      style: { stroke: '#059669', strokeWidth: 1.5 },
    });
  });

  // Candidates (split between 1-hop and 2-hop)
  const oneHop = candidates.filter((c) => c.relationshipDistance === 1);
  const twoHop = candidates.filter((c) => c.relationshipDistance === 2);

  const placeRow = (group: Candidate[], y: number, nodeType: string, edgeColor: string) => {
    const total = group.length;
    group.forEach((candidate, i) => {
      const x = (W / (total + 1)) * (i + 1) - 60;
      nodes.push({
        id: candidate.id,
        type: 'trust',
        position: { x, y },
        data: {
          label: candidate.name,
          nodeType,
          sublabel: candidate.technicalArea,
          photo: candidate.photo ?? null,
        } as NodeData,
      });
      const founderIdx = i % founderCount;
      edges.push({
        id: `e-f-${candidate.id}`,
        source: `founder-${founderIdx}`,
        target: candidate.id,
        animated: true,
        label: (candidate.connectionPath[2] ?? '').slice(0, 20) || undefined,
        labelStyle: { fill: '#475569', fontSize: 8 },
        labelBgStyle: { fill: '#0F172A', fillOpacity: 0.7 },
        style: { stroke: edgeColor, strokeWidth: 1.5, strokeDasharray: nodeType === 'candidate' ? '4 2' : undefined },
      });
    });
  };

  placeRow(oneHop.slice(0, 8), 340, 'connection', '#7C3AED');
  placeRow(twoHop.slice(0, 8), 460, 'candidate', '#D97706');

  return { nodes, edges };
}

export default function TrustGraph({ company, candidates, selectedCandidateId, onSelectCandidate }: Props) {
  const { nodes, edges } = useMemo(
    () => layoutNodes(company, candidates),
    [company, candidates]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const candidate = candidates.find((c) => c.id === node.id);
      if (candidate) onSelectCandidate(candidate);
    },
    [candidates, onSelectCandidate]
  );

  const styledNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === selectedCandidateId,
      })),
    [nodes, selectedCandidateId]
  );

  return (
    <div className="w-full h-full bg-[#0A0E1A] rounded-xl overflow-hidden">
      <ReactFlow
        nodes={styledNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#1E293B" gap={24} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} className="bg-[#1E293B]" />
        <MiniMap
          nodeColor={(node) => NODE_COLORS[(node.data as NodeData)?.nodeType] ?? '#64748B'}
          maskColor="rgba(10,14,26,0.7)"
          style={{ background: '#1E293B' }}
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-16 left-3 flex flex-col gap-1.5 pointer-events-none">
        {[
          { color: NODE_COLORS.playfair, label: 'Playfair' },
          { color: NODE_COLORS.company, label: 'Portfolio Company' },
          { color: NODE_COLORS.founder, label: 'Founder' },
          { color: NODE_COLORS.connection, label: '1 Hop' },
          { color: NODE_COLORS.candidate, label: '2 Hops' },
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
