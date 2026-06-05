import { NavLink, useNavigate } from "react-router-dom";
import { useGuardianStore } from "@/hooks/useGuardianStore";

const NAV = [
  {
    section: "MONITORING",
    items: [
      { to: "/dashboard",  label: "Dashboard",      icon: "ti-layout-dashboard" },
    ],
  },
  {
    section: "ANALYSIS",
    items: [
      { to: "/firewall",   label: "Prompt Firewall",  icon: "ti-shield-bolt" },
      { to: "/actions",    label: "Action Monitor",   icon: "ti-activity" },
      { to: "/timeline",   label: "Exec Timeline",    icon: "ti-sitemap" },
      { to: "/secrets",    label: "Secret Detection", icon: "ti-key" },
      { to: "/rag",        label: "RAG Security",     icon: "ti-vaccine" },
    ],
  },
  {
    section: "TESTING",
    items: [
      { to: "/simulator",  label: "Attack Simulator", icon: "ti-sword",  badge: "RED" },
    ],
  },
  {
    section: "AGENTS",
    items: [
      { to: "/multiagent", label: "Multi-Agent",      icon: "ti-network" },
      { to: "/mcp",        label: "MCP Tools",        icon: "ti-plug" },
      { to: "/trust",      label: "Trust Engine",     icon: "ti-shield-star" },
    ],
  },
  {
    section: "GOVERNANCE",
    items: [
      { to: "/policies",   label: "Policy Engine",    icon: "ti-lock" },
      { to: "/audit",      label: "Audit Logs",       icon: "ti-clipboard-list" },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { to: "/soc",        label: "SOC View",         icon: "ti-radar",     badgeDynamic: "threats" },
      { to: "/executive",  label: "Executive",        icon: "ti-chart-bar" },
    ],
  },
  {
    section: "TOOLS",
    items: [
      { to: "/copilot",    label: "AI Copilot",       icon: "ti-robot",    badge: "AI",  badgeGreen: true },
      { to: "/demo",       label: "Demo Mode",        icon: "ti-player-play" },
    ],
  },
];

export default function Sidebar() {
  const stats       = useGuardianStore((s) => s.stats);
  const systemTrust = useGuardianStore((s) => s.systemTrust);
  const navigate    = useNavigate();

  const trustColor =
    systemTrust >= 70 ? "var(--accent3)" :
    systemTrust >= 50 ? "var(--warn)" : "var(--accent2)";

  return (
    <nav style={{
      position: "fixed", left: 0, top: 0, height: "100vh", width: 220,
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      zIndex: 100, display: "flex", flexDirection: "column", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div className="dot-pulse" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.25 }}>
              AI Agent <span style={{ color: "var(--accent)" }}>Security</span>
              <br />Guardian
            </div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "1.5px" }}>
          SENTINEL-AI // v4.0.0
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, paddingBottom: 8 }}>
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div style={{
              padding: "12px 12px 4px",
              fontFamily: "var(--mono)", fontSize: 9,
              color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase",
            }}>
              {section}
            </div>
            {items.map((item) => {
              const dynamicBadge = item.badgeDynamic === "threats" && stats.threats > 0
                ? stats.threats
                : null;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "9px 12px", margin: "1px 6px", borderRadius: 5,
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                    textDecoration: "none", transition: "all 0.15s",
                    border: "1px solid transparent",
                    color:      isActive ? "var(--accent)" : "var(--muted)",
                    background: isActive ? "rgba(0,212,255,0.10)" : "transparent",
                    borderColor: isActive ? "rgba(0,212,255,0.20)" : "transparent",
                  })}
                >
                  <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                  <span style={{ flex: 1 }}>{item.label}</span>

                  {/* Static badge */}
                  {item.badge && !dynamicBadge && (
                    <span style={{
                      background: item.badgeGreen ? "rgba(0,255,157,0.15)" : "rgba(255,64,96,0.18)",
                      color:      item.badgeGreen ? "var(--accent3)" : "var(--accent2)",
                      border:     `1px solid ${item.badgeGreen ? "rgba(0,255,157,0.3)" : "rgba(255,64,96,0.3)"}`,
                      borderRadius: 3, padding: "1px 6px",
                      fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.5px",
                    }}>
                      {item.badge}
                    </span>
                  )}

                  {/* Dynamic threat count badge */}
                  {dynamicBadge && (
                    <span style={{
                      background: "rgba(255,64,96,0.18)", color: "var(--accent2)",
                      border: "1px solid rgba(255,64,96,0.3)",
                      borderRadius: 3, padding: "1px 6px",
                      fontFamily: "var(--mono)", fontSize: 9,
                    }}>
                      {dynamicBadge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* System trust score meter */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 6, padding: "10px 12px",
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "1.5px", marginBottom: 6 }}>
            SYSTEM TRUST SCORE
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden", marginBottom: 5 }}>
            <div style={{
              height: "100%", width: `${systemTrust}%`,
              background: trustColor, borderRadius: 2,
              transition: "width 0.8s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: trustColor }}>
              {systemTrust}/100
            </span>
            <button
              onClick={() => navigate("/trust")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)",
                letterSpacing: "1px", textTransform: "uppercase",
              }}
            >
              VIEW →
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
