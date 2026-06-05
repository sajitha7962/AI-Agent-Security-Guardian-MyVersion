/**
 * DonutChart — SVG donut used for severity distribution on SOC and Dashboard.
 * segments: [{ label, value, color }]
 */
export default function DonutChart({ segments = [], size = 140, strokeWidth = 22 }) {
  const r       = (size - strokeWidth) / 2;
  const cx      = size / 2;
  const cy      = size / 2;
  const circ    = 2 * Math.PI * r;
  const total   = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct   = seg.value / total;
    const dash  = pct * circ;
    const gap   = circ - dash;
    const arc   = { ...seg, dash, gap, offset: offset * circ };
    offset     += pct;
    return arc;
  });

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(26,58,92,0.6)" strokeWidth={strokeWidth} />

        {/* Segment arcs */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth - 2}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        ))}

        {/* Centre label */}
        <text x={cx} y={cy - 5} textAnchor="middle"
          fill="white" fontSize={size * 0.16}
          fontFamily="'Share Tech Mono',monospace">
          {total}
        </text>
        <text x={cx} y={cy + size * 0.1} textAnchor="middle"
          fill="rgba(74,122,155,0.9)" fontSize={size * 0.07}
          fontFamily="'Share Tech Mono',monospace" letterSpacing="1">
          TOTAL
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
              {seg.label} ({seg.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
