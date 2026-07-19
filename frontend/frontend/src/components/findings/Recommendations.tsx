import {
  Lightbulb,
  ArrowUpRight,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface RecommendationsProps {
  recommendations: string[];
}

export default function Recommendations({
  recommendations,
}: RecommendationsProps) {
  return (
    <GlassCard>
      <CardTitle icon={<Lightbulb size={18} />}>
        Recommendations
      </CardTitle>

      <p
        style={{
          color: "#94A3B8",
          marginTop: 8,
          marginBottom: 28,
          fontSize: 14,
        }}
      >
        AI-generated improvements to enhance code quality,
        maintainability and security.
      </p>

      {recommendations.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#94A3B8",
          }}
        >
          No recommendations available.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {recommendations.map((item, index) => (
            <RecommendationCard
              key={index}
              recommendation={item}
              index={index}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: string;
  index: number;
}) {
  const levels = [
    {
      label: "HIGH",
      color: "#EF4444",
      icon: <AlertTriangle size={18} />,
      impact: "+12% Health",
    },
    {
      label: "MEDIUM",
      color: "#F59E0B",
      icon: <ShieldAlert size={18} />,
      impact: "+6% Health",
    },
    {
      label: "LOW",
      color: "#22C55E",
      icon: <CheckCircle2 size={18} />,
      impact: "+2% Health",
    },
  ];

  const level = levels[Math.min(index, 2)];

  return (
    <div
      style={{
        background: "#172436",
        borderRadius: 18,
        border: `1px solid ${level.color}30`,
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ color: level.color }}>
            {level.icon}
          </div>

          <div
            style={{
              color: level.color,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {level.label} PRIORITY
          </div>
        </div>

        <div
          style={{
            color: "#38BDF8",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {level.impact}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              color: "white",
              fontSize: 19,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {recommendation}
          </h3>

          <p
            style={{
              color: "#94A3B8",
              lineHeight: 1.7,
              fontSize: 14,
            }}
          >
            Applying this recommendation will improve the overall
            architecture, maintainability and reliability of the
            repository.
          </p>
        </div>

        
      </div>
    </div>
  );
}