"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
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

export default function TriageGraph({ graph, highlightId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(() => {
    return {
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: graph.links.map((l) => ({ ...l })),
    };
  }, [graph]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2D
        graphData={data}
        backgroundColor="#0a0a0a"
        nodeRelSize={6}
        nodeVal={(n) => 24 - ((n as GraphNode).esi - 1) * 4}
        linkColor={() => "rgba(255,255,255,0.12)"}
        linkWidth={0.8}
        cooldownTicks={120}
        nodeCanvasObject={(rawNode, ctx, globalScale) => {
          const node = rawNode as GraphNode;
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const isHi = highlightId === node.id;
          const radius = (24 - (node.esi - 1) * 4) / 2 + 4;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = ESI_COLOR[node.esi];
          ctx.fill();

          if (isHi) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3 / globalScale;
            ctx.stroke();
          }

          const fontSize = Math.max(10, 12 / globalScale);
          ctx.font = `${fontSize}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(String(node.esi), x, y);

          ctx.fillStyle = "#fafafa";
          ctx.textBaseline = "top";
          ctx.fillText(node.label, x, y + radius + 2);
          ctx.fillStyle = "#a1a1aa";
          ctx.fillText(`${node.waitMinutes}m`, x, y + radius + 2 + fontSize + 1);
        }}
      />
    </div>
  );
}
