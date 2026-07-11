import { motion } from "framer-motion";

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
    <div className="flex flex-col">
      {workflow.map((w, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12 }}
          className="flex gap-3 pb-4 relative"
        >
          <div className="flex flex-col items-center">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: "#3DD9EB",
                boxShadow: "0 0 8px #3DD9EB",
              }}
            />

            {i < workflow.length - 1 && (
              <div
                className="w-px flex-1"
                style={{
                  background: "rgba(97,218,251,0.25)",
                }}
              />
            )}
          </div>

          <div className="pb-1">
            <p
              className="text-sm font-medium"
              style={{ color: "#F8FAFC" }}
            >
              {w.step}
            </p>

            <p
              className="text-[13px]"
              style={{ color: "#94A3B8" }}
            >
              {w.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}