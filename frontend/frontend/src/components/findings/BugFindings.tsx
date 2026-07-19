import {
  AlertTriangle,
  FileCode2,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface Bug {
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  fix: string;
  files: {
    file: string;
    line: number;
  }[];
}

interface BugFindingsProps {
  bugs: Bug[];
}

export default function BugFindings({
  bugs,
}: BugFindingsProps) {
  return (
    <GlassCard>
      <CardTitle icon={<AlertTriangle size={18} />}>
        Bug Findings
      </CardTitle>

      <p
        style={{
          color: "#94A3B8",
          marginTop: 8,
          marginBottom: 28,
          fontSize: 14,
        }}
      >
        AI detected{" "}
        <span style={{ color: "white", fontWeight: 600 }}>
          {bugs.length}
        </span>{" "}
        potential issue{bugs.length !== 1 && "s"} requiring attention.
      </p>

      {bugs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#94A3B8",
          }}
        >
          🎉 No bugs detected.
        </div>
      ) : (
        <div>
          {bugs.map((bug, index) => (
            <BugRow
              key={index}
              bug={bug}
              last={index === bugs.length - 1}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function BugRow({
  bug,
  last,
}: {
  bug: Bug;
  last: boolean;
}) {
  const colors = {
    HIGH: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW: "#22C55E",
  };

  return (
    <div
      style={{
        padding: "24px 0",
        borderBottom: last
          ? "none"
          : "1px solid rgba(148,163,184,.12)",
      }}
    >
      {/* Top Row */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 18,
          paddingLeft: "24px",
          paddingRight: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {/* Severity */}

          <div
            style={{
              background: `${colors[bug.severity]}18`,
              border: `1px solid ${colors[bug.severity]}55`,
              color: colors[bug.severity],
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              minWidth: 90,
              textAlign: "center",
            }}
          >
            {bug.severity}
          </div>

          {/* Title */}

          <div
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {bug.description}
          </div>
        </div>

        {/* File */}

        {bug.files[0] && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#172436",
              border: "1px solid rgba(61,217,235,.12)",
              borderRadius: 999,
              padding: "6px 14px",
              color: "#CBD5E1",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <FileCode2
              size={14}
              color="#38BDF8"
            />

            {bug.files[0].file}:{bug.files[0].line}
          </div>
        )}
      </div>

      {/* Fix */}

      <p
        style={{
          color: "#94A3B8",
          fontSize: 14,
          lineHeight: 1.7,
              paddingLeft: "170px",
    paddingRight: "24px",
        }}
      >
        {bug.fix}
      </p>
    </div>
  );
}