// ---------------------------------------------------------------------------
// Button — primary / danger / ghost / warn variants
// ---------------------------------------------------------------------------
const VARIANTS = {
  primary: {
    background: "var(--accent)", color: "#000",
    border: "none",
    hover: { background: "#33deff" },
  },
  danger: {
    background: "var(--accent2)", color: "#fff",
    border: "none",
    hover: { background: "#ff607a" },
  },
  ghost: {
    background: "transparent", color: "var(--muted)",
    border: "1px solid var(--border)",
    hover: { borderColor: "rgba(0,212,255,0.45)", color: "var(--accent)" },
  },
  warn: {
    background: "rgba(255,184,0,0.15)", color: "var(--warn)",
    border: "1px solid rgba(255,184,0,0.35)",
    hover: { background: "rgba(255,184,0,0.25)" },
  },
  success: {
    background: "rgba(0,255,157,0.12)", color: "var(--accent3)",
    border: "1px solid rgba(0,255,157,0.3)",
    hover: { background: "rgba(0,255,157,0.22)" },
  },
};

import { useState } from "react";

export default function Button({
  children,
  variant = "primary",
  size    = "md",
  disabled = false,
  loading  = false,
  icon,
  onClick,
  style,
  fullWidth = false,
  type = "button",
}) {
  const [hovered, setHovered] = useState(false);
  const v   = VARIANTS[variant] ?? VARIANTS.primary;
  const pad = size === "sm" ? "6px 12px" : size === "lg" ? "13px 26px" : "9px 18px";
  const fz  = size === "sm" ? 11 : size === "lg" ? 14 : 12;

  const base = {
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: pad, borderRadius: 6,
    fontFamily: "var(--sans)", fontSize: fz, fontWeight: 700,
    letterSpacing: "0.3px", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    transition: "all 0.15s", border: v.border ?? "none",
    background: hovered && !disabled ? (v.hover?.background ?? v.background) : v.background,
    color:      hovered && !disabled ? (v.hover?.color      ?? v.color)      : v.color,
    borderColor: hovered && !disabled ? (v.hover?.borderColor ?? undefined)   : undefined,
    width: fullWidth ? "100%" : undefined,
    justifyContent: fullWidth ? "center" : undefined,
    ...style,
  };

  return (
    <button
      type={type}
      style={base}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading ? (
        <div className="spinner" style={{ width: fz + 2, height: fz + 2 }} />
      ) : (
        icon && <i className={`ti ${icon}`} style={{ fontSize: fz + 2 }} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
