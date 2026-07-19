import { RotateCcw, CheckCircle2 } from "lucide-react";

interface DashboardHeaderProps {
  onAnalyzeAgain: () => void;
}

export default function DashboardHeader({
  onAnalyzeAgain,
}: DashboardHeaderProps) {
  return (
    <div
      style={{
        marginBottom: "56px",
      }}
    >
      {/* Analyze Again */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "28px",
        }}
      >
        <button
          onClick={onAnalyzeAgain}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 22px",
            borderRadius: "999px",
            border: "1px solid rgba(61,217,235,.15)",
            background: "#172436",
            color: "#E2E8F0",
            cursor: "pointer",
            fontWeight: 600,
            transition: ".2s",
          }}
        >
          <RotateCcw size={18} />
          Analyze Again
        </button>
      </div>

      {/* Heading */}

      <h1
        style={{
          textAlign: "center",
          color: "white",
          fontSize: "64px",
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: "16px",
        }}
      >
        Repository Analysis Report
      </h1>

      {/* Subtitle */}

      <p
        style={{
          textAlign: "center",
          color: "#94A3B8",
          fontSize: "20px",
          marginBottom: "34px",
        }}
      >
        AI-powered repository review completed successfully.
      </p>

      {/* Success Banner */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 26px",
            borderRadius: "999px",
            background: "rgba(34,197,94,.12)",
            border: "1px solid rgba(34,197,94,.28)",
            color: "#22C55E",
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={20} />
          Analysis Complete
        </div>
      </div>
    </div>
  );
}