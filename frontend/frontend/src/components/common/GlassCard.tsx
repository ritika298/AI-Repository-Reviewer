import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function GlassCard({
  children,
  className = "",
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 0 30px rgba(61,217,235,0.22)" }}
      className={`rounded-[20px] border p-5 ${className}`}
      style={{
        background: "rgba(18, 30, 48, 0.72)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(97,218,251,0.12)",
        boxShadow: "0 0 20px rgba(61,217,235,0.10)",
      }}
    >
      {children}
    </motion.div>
  );
}