import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

interface StepIconProps {
  status: string;
}

export default function StepIcon({ status }: StepIconProps) {
  if (status === "completed") {
    return <CheckCircle2 size={18} style={{ color: "#22C55E" }} />;
  }

  if (status === "running") {
    return (
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
        }}
      >
        <Circle
          size={18}
          style={{ color: "#3DD9EB" }}
          fill="#3DD9EB"
          fillOpacity={0.25}
        />
      </motion.div>
    );
  }

  return <Circle size={18} style={{ color: "#475569" }} />;
}