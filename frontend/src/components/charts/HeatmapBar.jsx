/**
 * HeatmapBar — a single labelled horizontal progress bar row
 * used in the SOC heatmap and Executive dashboard.
 */
export default function HeatmapBar({ label, value, max = 100, color, showPct = true }) {
  const pct = Math.min((value / max) * 100, 100);
  const auto = color ?? (
    pct >= 75 ? "var(--accent2)" :
    pct >= 50 ? "var(--warn)"   :
    pct >= 25 ? "var(--accent)" : "var(--accent3)"
  );

  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text)" }}>{label}</span>
        {showPct && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: auto }}>
            {typeof value === "number" && value <= 100 ? `${value}%` : value}
          </span>
        )}
      </div>
      <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: auto, borderRadius: 3,
          transition: "width 1s ease",
        }} />
      </div>
    </div>
  );
}
