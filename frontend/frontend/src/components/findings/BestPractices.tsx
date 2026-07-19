import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface BestPractice {
  category: string;
  status: "PASSED" | "FAILED";
  details: string;
}

interface BestPracticesProps {
  bestPractices: BestPractice[];
}

export default function BestPractices({
  bestPractices,
}: BestPracticesProps) {
  return (
    <GlassCard>
      <CardTitle icon={<ShieldCheck size={18} />}>
        Best Practices
      </CardTitle>

      <p
        style={{
          color: "#94A3B8",
          marginTop: 8,
          marginBottom: 24,
          fontSize: 14,
        }}
      >
        AI evaluated engineering standards and coding practices.
      </p>

      {bestPractices.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px 0",
            color: "#94A3B8",
          }}
        >
          No best practice data available.
        </div>
      ) : (
        <div>
          {bestPractices.map((practice, index) => (
            <PracticeRow
              key={index}
              practice={practice}
              last={index === bestPractices.length - 1}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function PracticeRow({
  practice,
  last,
}: {
  practice: BestPractice;
  last: boolean;
}) {
  const passed = practice.status === "PASSED";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "22px 40px",
        borderBottom: last
          ? "none"
          : "1px solid rgba(148,163,184,.12)",
      }}
    >
      {/* Status Icon */}

      <div
        style={{
          color: passed ? "#22C55E" : "#F59E0B",
          flexShrink: 0,
        }}
      >
        {passed ? (
          <CheckCircle2 size={20} />
        ) : (
          <AlertTriangle size={20} />
        )}
      </div>

      {/* Text */}

      <div
        style={{
          width: "55%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "white",
            fontWeight: 600,
            fontSize: 17,
            marginBottom: 6,
          }}
        >
          {practice.category}
        </div>

        <div
          style={{
            color: "#94A3B8",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          {practice.details}
        </div>
      </div>

      {/* Badge */}

      <div
        style={{
          background: passed
            ? "rgba(34,197,94,.12)"
            : "rgba(245,158,11,.12)",
          border: `1px solid ${
            passed
              ? "rgba(34,197,94,.25)"
              : "rgba(245,158,11,.25)"
          }`,
          color: passed ? "#22C55E" : "#F59E0B",
          padding: "8px 18px",
          borderRadius: 999,
          fontWeight: 700,
          fontSize: 12,
          minWidth: 95,
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {practice.status}
      </div>
    </div>
  );
}