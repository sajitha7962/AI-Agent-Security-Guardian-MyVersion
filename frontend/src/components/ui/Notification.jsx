import { useEffect } from "react";

// Notification — fixed overlay toast (threat = red left border, safe = green)
export default function Notification({ notif, onClose }) {
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [notif, onClose]);

  if (!notif) return null;

  const isThreat = notif.type === "threat";
  const label    = isThreat ? "⚠ THREAT DETECTED" : "✓ ACTION ALLOWED";
  const labelClr = isThreat ? "var(--accent2)" : "var(--accent3)";

  return (
    <div className={`notif-toast ${notif.type}`} role="alert">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: labelClr, letterSpacing: "1.5px" }}>
          {label}
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", fontSize: 16, lineHeight: 1, padding: 0,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.5 }}>
        {notif.msg}
      </div>
    </div>
  );
}
