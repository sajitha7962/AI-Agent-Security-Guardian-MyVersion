// MiniBar — simple SVG bar chart used in dashboard severity distribution
export default function MiniBar({ data = [], colors, height = 60, labels }) {
  if (!data.length) return null;
  const max  = Math.max(...data, 1);
  const barW = 32;
  const gap  = 8;
  const W    = data.length * (barW + gap);

  const defaultColors = ["#ff4060", "#ff607a", "#ffb800", "#00d4ff", "#00ff9d"];

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
        {data.map((v, i) => {
          const barH = Math.max((v / max) * (height - 8), 4);
          const x    = i * (barW + gap);
          const y    = height - barH;
          const fill = colors ? colors[i % colors.length] : defaultColors[i % defaultColors.length];
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx="3" fill={fill} opacity="0.7" />
              <rect x={x} y={y} width={barW} height={3} rx="2" fill={fill} />
            </g>
          );
        })}
      </svg>
      {labels && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
          {labels.map((l, i) => (
            <span key={i} style={{
              fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: colors ? colors[i % colors.length] : defaultColors[i % defaultColors.length],
                display: "inline-block", flexShrink: 0,
              }} />
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
