import { motion } from "framer-motion";
import { Bug } from "lucide-react";

import GlassCard from "../common/GlassCard";
import CardTitle from "../common/CardTitle";

interface BugFinding {
  file: string;
  line: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  fix: string;
}

interface BugFindingsProps {
  bugs: BugFinding[];
  severityColor: (
    severity: string
  ) => {
    text: string;
    bg: string;
    border: string;
  };
}

export default function BugFindings({
  bugs,
  severityColor,
}: BugFindingsProps) {
  return (
    <GlassCard>
      <CardTitle icon={<Bug size={18} />}>
        Bug Findings
      </CardTitle>

      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
        {bugs.length > 0 ? (
          bugs.map((bug, i) => {
            const colors = severityColor(bug.severity);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[14px] p-3"
                style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color: colors.text,
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    {bug.severity}
                  </span>

                  <span
                    className="text-[11px]"
                    style={{ color: "#94A3B8" }}
                  >
                    {bug.file}:{bug.line}
                  </span>
                </div>

                <p
                  className="text-[13px] mb-1"
                  style={{ color: "#F8FAFC" }}
                >
                  {bug.description}
                </p>

                <p
                  className="text-[12px]"
                  style={{ color: "#94A3B8" }}
                >
                  Fix: {bug.fix}
                </p>
              </motion.div>
            );
          })
        ) : (
          <p
            className="text-[13px]"
            style={{ color: "#64748B" }}
          >
            No bugs detected yet.
          </p>
        )}
      </div>
    </GlassCard>
  );
}