// SparkLine — lightweight SVG polyline chart, no external dependency
export default function SparkLine({ data = [], color = "#00d4ff", height = 50, label }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const W   = 200;
  const H   = height;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - (v / max) * (H - 4)}`
  ).join(" ");

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* Fill area */}
        <polyline
          points={`0,${H} ${pts} ${W},${H}`}
          fill={color} opacity="0.08"
        />
        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.85"
        />
        {/* Last point dot */}
        {data.length > 1 && (() => {
          const last = pts.split(" ").pop().split(",");
          return <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />;
        })()}
      </svg>
      {label && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", marginTop: 5, textAlign: "right", letterSpacing: "1px" }}>
          {label}
        </div>
      )}
    </div>
  );
}
