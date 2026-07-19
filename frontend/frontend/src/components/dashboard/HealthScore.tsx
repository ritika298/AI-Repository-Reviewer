interface HealthScoreProps {
  score: number;
}

export default function HealthScore({
  score,
}: HealthScoreProps) {
  const radius = 80;
  const stroke = 12;

  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (score / 100) * circumference;

  return (
    <div
      style={{
        background: "#111C2A",
        borderRadius: "24px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "360px",
        border: "1px solid rgba(61,217,235,.08)",
      }}
    >
      <h2
        style={{
          color: "white",
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "28px",
        }}
      >
        Repository Health
      </h2>

      <div
        style={{
          position: "relative",
          width: "220px",
          height: "220px",
        }}
      >
        <svg
          width="220"
          height="220"
        >
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#1E293B"
            strokeWidth={stroke}
            fill="none"
          />

          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#22C55E"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 110 110)"
          />
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: "52px",
              fontWeight: 800,
            }}
          >
            {score}%
          </div>

          <div
            style={{
              color: "#22C55E",
              fontWeight: 700,
              marginTop: "4px",
            }}
          >
            EXCELLENT
          </div>
        </div>
      </div>

      <p
        style={{
          marginTop: "24px",
          color: "#94A3B8",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        Overall repository quality based on architecture,
        security, best practices and maintainability.
      </p>
    </div>
  );
}