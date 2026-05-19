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
  fx?: number;
};

const LANE_WIDTH = 220;

function laneX(esi: ESILevel): number {
  return (esi - 3) * LANE_WIDTH;
}

function nodeRadius(esi: ESILevel): number {
  return 13 - (esi - 1) * 1.2;
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
      nodes: graph.nodes.map((n) => ({
        ...n,
        fx: laneX(n.esi),
      })),
      links: graph.links.map((l) => ({ ...l })),
    };
  }, [graph]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength?.(-380);
    fg.d3Force("link")?.distance?.(40);
  }, [data]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <ForceGraph2D
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={fgRef as any}
        graphData={data}
        backgroundColor="#0a0a0a"
        nodeRelSize={4}
        linkColor={() => "rgba(255,255,255,0.06)"}
        linkWidth={0.6}
        cooldownTicks={160}
        onRenderFramePre={(ctx, globalScale) => {
          const lanes: { esi: ESILevel; label: string }[] = [
            { esi: 1, label: "Inmediato" },
            { esi: 2, label: "Urgente" },
            { esi: 3, label: "Menos urgente" },
            { esi: 4, label: "No urgente" },
            { esi: 5, label: "Administrativo" },
          ];
          ctx.save();
          ctx.font = `${10 / globalScale}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          for (const lane of lanes) {
            const x = laneX(lane.esi);
            ctx.fillStyle = "rgba(255,255,255,0.025)";
            ctx.fillRect(x - LANE_WIDTH / 2, -2000, LANE_WIDTH, 4000);
            ctx.fillStyle = ESI_COLOR[lane.esi] + "60";
            ctx.fillText(`ESI ${lane.esi}`, x, -380);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillText(lane.label, x, -380 + 14 / globalScale);
          }
          ctx.restore();
        }}
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

          const numFont = Math.max(7, r * 0.95);
          ctx.font = `bold ${numFont}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(String(node.esi), x, y);

          const labelFont = 9;
          ctx.font = `${labelFont}px Inter, sans-serif`;
          ctx.textBaseline = "top";
          const labelY = y + r + 3;
          const text = node.label;
          const textW = ctx.measureText(text).width;
          ctx.fillStyle = "rgba(0,0,0,0.85)";
          ctx.fillRect(x - textW / 2 - 4, labelY - 1, textW + 8, labelFont + 4);
          ctx.fillStyle = "#fafafa";
          ctx.fillText(text, x, labelY + 1);

          if (isHi) {
            const waitText = `~${node.waitMinutes}min`;
            const waitW = ctx.measureText(waitText).width;
            const waitY = labelY + labelFont + 5;
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.fillRect(x - waitW / 2 - 4, waitY - 1, waitW + 8, labelFont + 4);
            ctx.fillStyle = "#fbbf24";
            ctx.fillText(waitText, x, waitY + 1);
          }
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
