import { useNavigate } from "react-router-dom";
import { useGuardianStore } from "@/hooks/useGuardianStore";

export default function Topbar({ title, subtitle }) {
  const navigate = useNavigate();
  const stats    = useGuardianStore((s) => s.stats);

  return (
    <header style={{
      height: 52, borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px",
      background: "rgba(5,10,15,0.92)", backdropFilter: "blur(8px)",
      position: "sticky", top: 0, zIndex: 50, flexShrink: 0,
    }}>
      {/* Left — page title */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "-0.2px" }}>
          {title}
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "1.2px" }}>
          {subtitle}
        </div>
      </div>

      {/* Right — status indicators + quick actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* Guardian active status */}
        <div className="status-pill">
          <div className="status-dot" />
          GUARDIAN ACTIVE
        </div>

        {/* Live threat counter */}
        <div style={{
          fontFamily: "var(--mono)", fontSize: 9, color: stats.threats > 0 ? "var(--accent2)" : "var(--muted)",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 4, padding: "4px 10px", letterSpacing: "0.5px",
        }}>
          THREATS: <span style={{ color: "var(--accent2)", fontWeight: 700 }}>{stats.threats}</span>
        </div>

        {/* Demo mode shortcut */}
        <button
          onClick={() => navigate("/demo")}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 5, padding: "6px 12px",
            fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600,
            color: "var(--muted)", cursor: "pointer", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <i className="ti ti-player-play" style={{ fontSize: 14 }} aria-hidden="true" />
          DEMO
        </button>

        {/* SOC shortcut */}
        <button
          onClick={() => navigate("/soc")}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 5, padding: "6px 12px",
            fontFamily: "var(--sans)", fontSize: 11, fontWeight: 600,
            color: "var(--muted)", cursor: "pointer", transition: "all 0.15s",
            display: "flex", alignItems: "center", gap: 6,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,64,96,0.4)"; e.currentTarget.style.color = "var(--accent2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <i className="ti ti-radar" style={{ fontSize: 14 }} aria-hidden="true" />
          SOC
        </button>
      </div>
    </header>
  );
}
