import { motion } from "framer-motion";

interface Subsystem {
  name: string;
  purpose: string;
  keyFiles: string[];
}

interface SubsystemCardProps {
  subsystem: Subsystem;
  index: number;
}

export default function SubsystemCard({
  subsystem,
  index,
}: SubsystemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-[14px] p-3"
      style={{
        background: "rgba(97,218,235,0.05)",
        border: "1px solid rgba(97,218,251,0.10)",
      }}
    >
      <p
        className="font-semibold text-sm mb-1"
        style={{ color: "#3DD9EB" }}
      >
        {subsystem.name}
      </p>

      <p
        className="text-[13px] mb-2"
        style={{ color: "#CBD5E1" }}
      >
        {subsystem.purpose}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {subsystem.keyFiles.map((file, i) => (
          <span
            key={i}
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(61,217,235,0.10)",
              color: "#66FCF1",
            }}
          >
            {file}
          </span>
        ))}
      </div>
    </motion.div>
  );
}