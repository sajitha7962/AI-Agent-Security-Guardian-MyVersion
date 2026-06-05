// ScoreBar — labelled horizontal progress bar
export default function ScoreBar({ label, value, max = 100, color, showValue = true, height = 5 }) {
  const pct   = Math.min((value / max) * 100, 100);
  const auto  = !color
    ? pct >= 75 ? "var(--accent2)"
    : pct >= 50 ? "var(--warn)"
    : pct >= 25 ? "var(--accent)"
    : "var(--accent3)"
    : color;

  return (
    <div style={{ marginBottom: 10 }}>
      {(label || showValue) && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontFamily: "var(--mono)", fontSize: 10,
          color: "var(--muted)", marginBottom: 5,
        }}>
          {label && <span>{label}</span>}
          {showValue && <span style={{ color: auto }}>{value}/{max}</span>}
        </div>
      )}
      <div className="score-bar-track" style={{ height }}>
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: auto, height }}
        />
      </div>
    </div>
  );
}

// TrustMeter — circular SVG gauge used in sidebars and agent cards
export function TrustMeter({ score = 100, size = "sm" }) {
  const color =
    score >= 80 ? "var(--accent3)" :
    score >= 60 ? "var(--accent)"  :
    score >= 40 ? "var(--warn)"    : "var(--accent2)";

  const label =
    score >= 80 ? "TRUSTED"   :
    score >= 60 ? "MODERATE"  :
    score >= 40 ? "CAUTION"   : "UNTRUSTED";

  if (size === "lg") {
    const r = 40, circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    return (
      <div style={{ textAlign: "center" }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(26,58,92,0.8)" strokeWidth="7" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            transform="rotate(-90 50 50)" style={{ transition: "stroke-dasharray 1s ease" }} />
          <text x="50" y="46" textAnchor="middle" fill="white" fontSize="16"
            fontFamily="'Share Tech Mono',monospace">{score}</text>
          <text x="50" y="60" textAnchor="middle" fill="rgba(74,122,155,0.9)" fontSize="7"
            fontFamily="'Share Tech Mono',monospace" letterSpacing="1">{label}</text>
        </svg>
      </div>
    );
  }

  // Small inline bar version
  return (
    <div style={{ minWidth: 90 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "1.5px" }}>TRUST</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color }}>{score}</span>
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}
