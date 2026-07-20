import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";

interface WorkflowStep {
  step: string;
  description: string;
}

interface WorkflowTimelineProps {
  workflow: WorkflowStep[];
}

export default function WorkflowTimeline({
  workflow,
}: WorkflowTimelineProps) {
  return (
  <div
    style={{
      position: "relative",
    }}
  >
      {/* Heading */}
      <div
  style={{
    width: "100%",
    height: 2,
    borderRadius: 999,
    background:
      "linear-gradient(90deg,#3DD9EB,rgba(61,217,235,.12),transparent)",
    marginBottom: 22,
  }}
/>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "rgba(61,217,235,.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(61,217,235,.15)",
          }}
        >
          <GitBranch
            size={17}
            color="#3DD9EB"
          />
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              color: "#F8FAFC",
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: "-0.4px",
            }}
          >
            Execution Workflow
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              color: "#94A3B8",
              fontSize: 13,
            }}
          >
            Step-by-step execution flow discovered by the AI.
          </p>
        </div>
      </div>
        <div
  style={{
    width: "100%",
    height: 2,
    borderRadius: 999,
    background:
      "linear-gradient(90deg,#3DD9EB,rgba(61,217,235,.12),transparent)",
    marginBottom: 22,
  }}
/>

      {/* Timeline */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {workflow.map((w, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: i * 0.08,
            }}
            style={{
              display: "flex",
              gap: 18,
              background: "#172436",
              border: "1px solid rgba(61,217,235,.08)",
              borderRadius: 16,
              padding: "16px 18px",
            }}
          >
            {/* Timeline */}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 18,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#3DD9EB",
                  boxShadow:
                    "0 0 12px rgba(61,217,235,.7)",
                }}
              />

              {i < workflow.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    marginTop: 6,
                    background:
                      "linear-gradient(to bottom,#3DD9EB,rgba(61,217,235,.15))",
                  }}
                />
              )}
            </div>

            {/* Text */}

            <div>
              <div
                style={{
                  color: "#F8FAFC",
                  fontWeight: 700,
                  fontSize: 17,
                  marginBottom: 6,
                }}
              >
                {w.step}
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 14,
                  lineHeight: 1.65,
                }}
              >
                {w.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}