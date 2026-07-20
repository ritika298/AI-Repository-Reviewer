import { FolderTree, Boxes } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface Architecture {
  description: string;
  diagram: string;
  patterns: string[];
}

interface ArchitectureCardProps {
  report: {
    architecture: Architecture;
  };
}

export default function ArchitectureCard({
  report,
}: ArchitectureCardProps) {
  return (
    <GlassCard delay={0.08}>
      {/* Header */}

    {/* Header */}

<div
  style={{
    marginTop: 8,
    marginBottom: 22,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    }}
  >
    <FolderTree size={22} color="#3DD9EB" />

    <h2
      style={{
        margin: 0,
        color: "#F8FAFC",
        fontSize: 18,
        fontWeight: 800,
        letterSpacing: "-0.4px",
      }}
    >
      Architecture
    </h2>
  </div>

  <div
    style={{
      width: "100%",
      height: 2,
      borderRadius: 999,
      background:
        "linear-gradient(90deg,#3DD9EB,rgba(61,217,235,.20),transparent)",
    }}
  />
</div>
      {/* Description */}

      <div
        style={{
          background: "rgba(61,217,235,.05)",
          border: "1px solid rgba(61,217,235,.08)",
          borderRadius: 16,
          padding: "16px 18px",
          marginBottom: 22,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#CBD5E1",
            fontSize: 14,
            lineHeight: 1.75,
          }}
        >
          {report.architecture.description}
        </p>
      </div>

      {/* Diagram */}

      <div
        style={{
          background:
            "linear-gradient(180deg,#0F172A,#111827)",
          borderRadius: 18,
          border: "1px solid rgba(61,217,235,.10)",
          overflow: "hidden",
          marginBottom: 22,
        }}
      >
        {/* fake window bar */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid rgba(61,217,235,.08)",
            background: "#111C2D",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#EF4444",
              }}
            />

            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#F59E0B",
              }}
            />

            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#22C55E",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#94A3B8",
              fontSize: 13,
            }}
          >
            <Boxes size={14} />
            Architecture Diagram
          </div>
        </div>

        {/* Diagram */}

        <pre
          style={{
            margin: 0,
            padding: "26px",
            color: "#66FCF1",
            fontSize: 13,
            lineHeight: 1.55,
            fontFamily:
              "JetBrains Mono, Fira Code, monospace",
            textAlign: "center",
            overflowX: "auto",
          }}
        >
          {report.architecture.diagram}
        </pre>
      </div>

      {/* Patterns */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {report.architecture.patterns.map((pattern, index) => (
          <div
            key={index}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              background:
                "rgba(61,217,235,.08)",
              border:
                "1px solid rgba(61,217,235,.18)",
              color: "#3DD9EB",
              fontWeight: 600,
              fontSize: 13,
              transition: ".25s",
            }}
          >
            {pattern}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}