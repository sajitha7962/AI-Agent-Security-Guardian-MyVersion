// ---------------------------------------------------------------------------
// Badge variants used throughout the platform
// ---------------------------------------------------------------------------

/** RiskBadge — CRITICAL / HIGH / MEDIUM / LOW */
export function RiskBadge({ level = "LOW", style }) {
  return (
    <span
      className={`rb-${level.toLowerCase()}`}
      style={{
        fontFamily: "var(--mono)", fontSize: 9,
        padding: "2px 8px", borderRadius: 3,
        letterSpacing: "1px", display: "inline-block",
        ...style,
      }}
    >
      {level}
    </span>
  );
}

/** DecisionBadge — ALLOW / WARN / BLOCK */
export function DecisionBadge({ decision = "ALLOW", style }) {
  return (
    <span
      className={`dec-${decision.toLowerCase()}`}
      style={{
        fontFamily: "var(--mono)", fontSize: 10,
        padding: "3px 10px", borderRadius: 3,
        letterSpacing: "1px", display: "inline-block",
        ...style,
      }}
    >
      {decision}
    </span>
  );
}

/** StatusBadge — active / monitored / restricted / resolved / etc. */
export function StatusBadge({ status = "active", style }) {
  const MAP = {
    active:        { bg: "rgba(0,255,157,0.1)",  color: "var(--accent3)", border: "rgba(0,255,157,0.3)" },
    monitored:     { bg: "rgba(255,184,0,0.1)",  color: "var(--warn)",    border: "rgba(255,184,0,0.3)" },
    restricted:    { bg: "rgba(255,64,96,0.1)",  color: "var(--accent2)", border: "rgba(255,64,96,0.3)" },
    investigating: { bg: "rgba(255,184,0,0.1)",  color: "var(--warn)",    border: "rgba(255,184,0,0.3)" },
    contained:     { bg: "rgba(0,212,255,0.1)",  color: "var(--accent)",  border: "rgba(0,212,255,0.25)" },
    resolved:      { bg: "rgba(0,255,157,0.1)",  color: "var(--accent3)", border: "rgba(0,255,157,0.3)" },
  };
  const s = MAP[status] ?? MAP.active;
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 3, padding: "2px 8px",
      fontFamily: "var(--mono)", fontSize: 9,
      letterSpacing: "1px", display: "inline-block",
      ...style,
    }}>
      {status.toUpperCase()}
    </span>
  );
}

/** LiveBadge — pulsing red LIVE indicator */
export function LiveBadge() {
  return (
    <div className="live-badge">
      <div className="live-dot" />
      LIVE
    </div>
  );
}

/** CategoryBadge — BLOCK / WARN for policies */
export function CategoryBadge({ category = "BLOCK" }) {
  return (
    <span className={category === "BLOCK" ? "dec-block" : "dec-warn"}
      style={{ fontSize: 9, padding: "1px 7px", borderRadius: 3, fontFamily: "var(--mono)", letterSpacing: "1px" }}>
      {category}
    </span>
  );
}
