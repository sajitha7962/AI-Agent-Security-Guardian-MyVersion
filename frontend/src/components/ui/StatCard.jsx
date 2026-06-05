// StatCard — the KPI cards displayed in the stats grid at the top of pages
// accent prop: "blue" | "red" | "green" | "warn"
const ACCENT_BORDER = {
  blue:  "var(--accent)",
  red:   "var(--accent2)",
  green: "var(--accent3)",
  warn:  "var(--warn)",
};

export default function StatCard({ num, label, delta, deltaType = "up", accent = "blue", icon, style }) {
  const borderColor = ACCENT_BORDER[accent] ?? "var(--accent)";

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 18,
      position: "relative",
      overflow: "hidden",
      borderTop: `2px solid ${borderColor}`,
      ...style,
    }}>
      {/* Background icon watermark */}
      {icon && (
        <i
          className={`ti ${icon}`}
          aria-hidden="true"
          style={{
            position: "absolute", right: 14, top: 14,
            fontSize: 28, color: borderColor, opacity: 0.08,
          }}
        />
      )}

      <div style={{ fontFamily: "var(--mono)", fontSize: 30, color: "#fff", marginBottom: 4 }}>
        {num}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.3px" }}>
        {label}
      </div>
      {delta && (
        <div style={{
          fontFamily: "var(--mono)", fontSize: 10, marginTop: 6,
          color: deltaType === "up" ? "var(--accent2)" : "var(--accent3)",
        }}>
          {delta}
        </div>
      )}
    </div>
  );
}
