import {
  Lightbulb,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

import { motion } from "framer-motion";

import GlassCard from "../common/GlassCard";

interface RecommendationsProps {
  recommendations: string[];
}

export default function Recommendations({
  recommendations,
}: RecommendationsProps) {
  return (
    <GlassCard>
      {/* Header */}

      <div
        style={{
          marginTop: 6,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Lightbulb
            size={30}
            color="#38BDF8"
          />

          <h2
            style={{
              margin: 0,
              color: "#F8FAFC",
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            Recommendations
          </h2>
        </div>

        <div
          style={{
            width: "100%",
            height: 2,
            margin: "18px 0 18px",
            borderRadius: 999,
            background:
              "linear-gradient(90deg,#38BDF8,#22C55E,transparent)",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#94A3B8",
            fontSize: 15,
            lineHeight: 1.65,
          }}
        >
          AI-generated recommendations to improve maintainability,
          reliability and overall repository quality.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#94A3B8",
            fontSize: 15,
          }}
        >
          🎉 No recommendations generated.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
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
      icon: <AlertTriangle size={16} />,
      impact: "+12%",
    },
    {
      label: "MEDIUM",
      color: "#F59E0B",
      icon: <ShieldAlert size={16} />,
      impact: "+6%",
    },
    {
      label: "LOW",
      color: "#22C55E",
      icon: <CheckCircle2 size={16} />,
      impact: "+2%",
    },
  ];

  const level = levels[Math.min(index, 2)];

  return (
    <motion.div
      whileHover={{
        y: -4,
        borderColor: "rgba(61,217,235,.18)",
        boxShadow: "0 10px 28px rgba(0,0,0,.22)",
      }}
      transition={{
        duration: 0.25,
      }}
      style={{
        background: "#172436",
        borderRadius: 18,
        border: "1px solid rgba(61,217,235,.08)",
        borderLeft: `5px solid ${level.color}`,
        padding: "16px 20px",
      }}
    >
      {/* Top Row */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 10,
        }}
      >
        {/* Left */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              color: level.color,
              display: "flex",
              alignItems: "center",
            }}
          >
            {level.icon}
          </div>

          <div
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: `${level.color}15`,
              border: `1px solid ${level.color}35`,
              color: level.color,
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: ".6px",
            }}
          >
            {level.label} PRIORITY
          </div>
        </div>

        {/* Right */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(56,189,248,.08)",
            border: "1px solid rgba(56,189,248,.16)",
            color: "#38BDF8",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          <TrendingUp size={14} />
          Health {level.impact}
        </div>
      </div>

      {/* Recommendation */}

      <div
        style={{
          color: "#F8FAFC",
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.45,
          marginBottom: 8,
        }}
      >
        {recommendation}
      </div>

      {/* Divider */}

      <div
        style={{
          height: 1,
          background: "rgba(61,217,235,.06)",
          marginBottom: 8,
        }}
      />

      {/* Description */}

      <div
        style={{
          color: "#94A3B8",
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        Applying this recommendation will improve maintainability,
        code quality and long-term repository health.
      </div>
    </motion.div>
  );
}