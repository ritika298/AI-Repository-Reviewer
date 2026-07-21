import {
 ShieldAlert,
  FileCode2,
  Wrench,
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
      {/* Header */}

      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  }}
>
  <ShieldAlert
              size={26}
              color="#38BDF8"
            />

  <h2
    style={{
      margin: 0,
      color: "#F8FAFC",
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: "-0.8px",
      lineHeight: 1.1,
    }}
  >
    Bug Findings
  </h2>
</div>

      <div
        style={{
          width: "100%",
          height: 2,
          margin: "16px 0 20px",
          borderRadius: 999,
          background:
            "linear-gradient(90deg,#22C55E,#38BDF8,transparent)",
        }}
      />

      <p
        style={{
          color: "#94A3B8",
          fontSize: 15,
          lineHeight: 1.7,
          marginBottom: 30,
        }}
      >
        The AI review detected{" "}
        <span
          style={{
            color: "white",
            fontWeight: 700,
          }}
        >
          {bugs.length}
        </span>{" "}
        potential issue
        {bugs.length !== 1 && "s"} requiring developer
        attention.
      </p>

      {bugs.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#94A3B8",
            fontSize: 16,
          }}
        >
          🎉 No bugs detected.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
          }}
        >
          {bugs.map((bug, index) => (
            <BugCard
              key={index}
              bug={bug}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function BugCard({
  bug,
}: {
  bug: Bug;
}) {
  const colors = {
    HIGH: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW: "#22C55E",
  };

  return (
    <div
      style={{
        background: "#172436",
        border: "1px solid rgba(61,217,235,.08)",
        borderRadius: 18,
        padding: 24,
        transition: ".25s",
      }}
    >
      {/* Top */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flex: 1,
          }}
        >
          <div
            style={{
              minWidth: 88,
              textAlign: "center",
              padding: "7px 16px",
              borderRadius: 999,
              background: `${colors[bug.severity]}18`,
              border: `1px solid ${colors[bug.severity]}55`,
              color: colors[bug.severity],
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            {bug.severity}
          </div>

          <div
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            {bug.description}
          </div>
        </div>

        {bug.files[0] && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(61,217,235,.08)",
              border:
                "1px solid rgba(61,217,235,.18)",
              borderRadius: 999,
              padding: "8px 16px",
              color: "#CBD5E1",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <FileCode2
              size={15}
              color="#3DD9EB"
            />

            {bug.files[0].file}:{bug.files[0].line}
          </div>
        )}
      </div>

      <div
        style={{
          height: 1,
          background:
            "rgba(61,217,235,.08)",
          marginBottom: 18,
        }}
      />

      {/* Fix */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background:
              "rgba(61,217,235,.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border:
              "1px solid rgba(61,217,235,.15)",
            flexShrink: 0,
          }}
        >
          <Wrench
            size={18}
            color="#3DD9EB"
          />
        </div>

        <div>
          <div
            style={{
              color: "#3DD9EB",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: ".4px",
            }}
          >
            Recommended Fix
          </div>

          <div
            style={{
              color: "#CBD5E1",
              fontSize: 15,
              lineHeight: 1.75,
            }}
          >
            {bug.fix}
          </div>
        </div>
      </div>
    </div>
  );
}