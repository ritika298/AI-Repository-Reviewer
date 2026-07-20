import { ShieldCheck } from "lucide-react";
import GlassCard from "../common/GlassCard";
import { motion } from "framer-motion";

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
      {/* Header */}

      <div
        style={{
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
          <ShieldCheck
            size={28}
            color="#38BDF8"
          />

          <h2
            style={{
              margin: 0,
              color: "#F8FAFC",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.6px",
            }}
          >
            Best Practices
          </h2>
        </div>

        <div
          style={{
            width: "100%",
            height: 2,
            margin: "18px 0",
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
          AI evaluated engineering standards and coding practices across the repository.
        </p>
      </div>

      {bestPractices.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#94A3B8",
          }}
        >
          No best practice data available.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: 18,
          }}
        >
          {bestPractices.map((practice, index) => (
            <PracticeCard
              key={index}
              practice={practice}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function PracticeCard({
  practice,
}: {
  practice: BestPractice;
}) {
  const passed = practice.status === "PASSED";

  return (
    <motion.div
      whileHover={{
        y: -3,
        borderColor: "rgba(61,217,235,.18)",
      }}
      transition={{
        duration: 0.25,
      }}
      style={{
        background: "#172436",
        borderRadius: 18,
        border: "1px solid rgba(61,217,235,.08)",
        borderLeft: `5px solid ${
          passed ? "#22C55E" : "#EF4444"
        }`,
        padding: "20px",
      }}
    >
      <div
        style={{
          color: "#F8FAFC",
          fontWeight: 700,
          fontSize: 20,
          marginBottom: 12,
        }}
      >
        {practice.category}
      </div>

      <div
        style={{
          color: "#94A3B8",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {practice.details}
      </div>
    </motion.div>
  );
}