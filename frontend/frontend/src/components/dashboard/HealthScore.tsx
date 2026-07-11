import AnimatedHealthScore from "../common/AnimatedHealthScore";

interface HealthScoreProps {
  score: number;
}

export default function HealthScore({
  score,
}: HealthScoreProps) {
  return <AnimatedHealthScore score={score} />;
}