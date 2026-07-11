import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedHealthScoreProps {
  score: number;
}

export default function AnimatedHealthScore({
  score,
}: AnimatedHealthScoreProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timeout);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;
  const color =
    score >= 80 ? "#22C55E" : score >= 55 ? "#F59E0B" : "#EF4444";

  return (
    <div
      className="flex items-center justify-center relative"
      style={{ width: 140, height: 140 }}
    >
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(97,218,251,0.10)"
          strokeWidth="10"
        />

        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform="rotate(-90 70 70)"
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span
          className="text-2xl font-bold"
          style={{ color: "#F8FAFC" }}
        >
          {animatedScore}
        </span>

        <span
          className="text-[10px] uppercase tracking-wide"
          style={{ color: "#94A3B8" }}
        >
          Health
        </span>
      </div>
    </div>
  );
}