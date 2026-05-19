"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import { ESI_COLOR } from "@/lib/triage/colors";
import type { ESILevel, GraphPayload, Patient } from "@/lib/triage/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface Props {
  graph: GraphPayload;
  highlightId?: string | null;
}

type GraphNode = {
  id: string;
  label: string;
  esi: ESILevel;
  waitMinutes: number;
  status: Patient["status"];
  chiefComplaint: string;
  x?: number;
  y?: number;
};

function nodeRadius(esi: ESILevel): number {
  return 22 - (esi - 1) * 2.5;
}

export default function TriageGraph({ graph, highlightId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  type ForceGraphHandle = {
    d3Force: (
      name: string,
    ) =>
      | {
          strength?: (n: number) => unknown;
          distance?: (n: number) => unknown;
        }
      | undefined;
    zoomToFit?: (ms: number, padding: number) => void;
  };
  const fgRef = useRef<ForceGraphHandle | undefined>(undefined);

  const data = useMemo(() => {
    return {
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: graph.links.map((l) => ({ ...l })),
    };
  }, [graph]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength?.(-420);
    fg.d3Force("link")?.distance?.(110);
  }, [data]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2D
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={fgRef as any}
        graphData={data}
        backgroundColor="#0a0a0a"
        nodeRelSize={6}
        linkColor={() => "rgba(255,255,255,0.08)"}
        linkWidth={0.6}
        cooldownTicks={140}
        nodeCanvasObject={(rawNode, ctx, globalScale) => {
          const node = rawNode as GraphNode;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const isHi = highlightId === node.id;
          const r = nodeRadius(node.esi);

          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.fillStyle = ESI_COLOR[node.esi];
          ctx.fill();

          if (isHi) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.5 / globalScale;
            ctx.stroke();
          }

          const numberFont = Math.max(8, r * 0.95);
          ctx.font = `bold ${numberFont}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(String(node.esi), x, y);

          const labelFont = 11;
          ctx.font = `${labelFont}px Inter, sans-serif`;
          ctx.textBaseline = "top";

          const labelY = y + r + 4;
          const padX = 5;
          const text = node.label;
          const textW = ctx.measureText(text).width;

          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.fillRect(x - textW / 2 - padX, labelY - 1, textW + padX * 2, labelFont + 4);
          ctx.fillStyle = "#fafafa";
          ctx.fillText(text, x, labelY + 1);

          const waitText = `~${node.waitMinutes}m`;
          const waitW = ctx.measureText(waitText).width;
          const waitY = labelY + labelFont + 5;
          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.fillRect(
            x - waitW / 2 - padX,
            waitY - 1,
            waitW + padX * 2,
            labelFont + 4,
          );
          ctx.fillStyle = isHi ? "#fbbf24" : "#a1a1aa";
          ctx.fillText(waitText, x, waitY + 1);
        }}
        nodePointerAreaPaint={(rawNode, color, ctx) => {
          const node = rawNode as GraphNode;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, nodeRadius(node.esi) + 4, 0, 2 * Math.PI);
          ctx.fill();
        }}
      />
    </div>
  );
}
