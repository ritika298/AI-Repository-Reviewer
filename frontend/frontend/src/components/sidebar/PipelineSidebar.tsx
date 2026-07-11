import { motion } from "framer-motion";
import { Bot } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";
import StepIcon from "../common/StepIcon";

interface PipelineStep {
  key: string;
  label: string;
  status: string;
}

interface PipelineSidebarProps {
  steps: PipelineStep[];
}

export default function PipelineSidebar({
  steps,
}: PipelineSidebarProps) {
  const completedCount = steps.filter(
    (s) => s.status === "completed"
  ).length;

  const progressPct = Math.round(
    (completedCount / steps.length) * 100
  );

  return (
    <GlassCard>
      <CardTitle icon={<Bot size={18} />}>
        🤖 Autonomous AI Workflow
      </CardTitle>

      <div className="mb-4">
        <div
          className="flex justify-between text-xs mb-1.5"
          style={{ color: "#94A3B8" }}
        >
          <span>Analysis Progress</span>

          <span style={{ color: "#3DD9EB" }}>
            {progressPct}%
          </span>
        </div>

        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{
            background: "rgba(97,218,251,0.10)",
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg,#66FCF1,#3DD9EB,#38BDF8)",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          />
        </div>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {steps.map((step, idx) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: idx * 0.03,
            }}
            className="flex items-center gap-2.5"
          >
            <StepIcon status={step.status} />

            <span
              className="text-[13px]"
              style={{
                color:
                  step.status === "waiting"
                    ? "#64748B"
                    : step.status === "running"
                    ? "#3DD9EB"
                    : "#CBD5E1",

                fontWeight:
                  step.status === "running"
                    ? 600
                    : 400,
              }}
            >
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}