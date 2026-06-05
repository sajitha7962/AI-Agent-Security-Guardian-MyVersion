// RadarChart — SVG spider diagram for security posture overview
export default function RadarChart({ scores = {}, size = 200 }) {
  const labels = Object.keys(scores);
  const vals   = Object.values(scores);
  const n      = labels.length;
  if (!n) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r  = (size / 2) * 0.72;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  const angleFor = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const ptFor    = (i, scale) => [
    cx + scale * r * Math.cos(angleFor(i)),
    cy + scale * r * Math.sin(angleFor(i)),
  ];

  // Data polygon
  const dataPts = vals.map((v, i) => ptFor(i, v / 100).join(",")).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid polygons */}
      {gridLevels.map((lv) => (
        <polygon
          key={lv}
          points={labels.map((_, i) => ptFor(i, lv).join(",")).join(" ")}
          fill="none"
          stroke="rgba(26,58,92,0.8)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {labels.map((_, i) => {
        const [x, y] = ptFor(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(26,58,92,0.55)" strokeWidth="1" />;
      })}

      {/* Data fill */}
      <polygon
        points={dataPts}
        fill="rgba(0,212,255,0.14)"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {vals.map((v, i) => {
        const [x, y] = ptFor(i, v / 100);
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />;
      })}

      {/* Labels */}
      {labels.map((lb, i) => {
        const [x, y] = ptFor(i, 1.22);
        return (
          <text
            key={i}
            x={x} y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(74,122,155,0.9)"
            fontSize={size * 0.038}
            fontFamily="'Share Tech Mono',monospace"
          >
            {lb}
          </text>
        );
      })}
    </svg>
  );
}
