import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { MCP_TOOLS } from "@/utils/constants";

export default function MCPSecurity() {
  const totalCalls   = MCP_TOOLS.reduce((s, t) => s + t.calls, 0);
  const totalBlocked = MCP_TOOLS.reduce((s, t) => s + t.blocked, 0);
  const highRisk     = MCP_TOOLS.filter((t) => t.risk >= 70).length;

  const level = (risk) =>
    risk >= 80 ? "CRITICAL" : risk >= 60 ? "HIGH" : risk >= 40 ? "MEDIUM" : "LOW";

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard num={MCP_TOOLS.length} label="Monitored Tools"  accent="blue"  icon="ti-plug" />
        <StatCard num={totalCalls}       label="Total Calls"       accent="blue"  icon="ti-activity" />
        <StatCard num={totalBlocked}     label="Blocked Calls"     accent="red"   icon="ti-shield-x" delta="Policy enforced" deltaType="up" />
        <StatCard num={highRisk}         label="High-Risk Tools"   accent="warn"  icon="ti-alert-triangle" />
      </div>

      {/* Tool table */}
      <Card>
        <CardHeader title="MCP TOOL RISK REGISTRY" icon="ti-plug" />

        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 90px 80px 80px 100px",
          gap: 12, padding: "9px 18px",
          background: "var(--surface2)",
          fontFamily: "var(--mono)", fontSize: 9,
          color: "var(--muted)", letterSpacing: "1.5px", textTransform: "uppercase",
        }}>
          <span>TOOL NAME</span>
          <span>RISK SCORE</span>
          <span>CALLS</span>
          <span>BLOCKED</span>
          <span>SEVERITY</span>
        </div>

        {MCP_TOOLS.map((t, i) => {
          const riskColor =
            t.risk >= 80 ? "var(--accent2)" :
            t.risk >= 60 ? "var(--warn)"    :
            t.risk >= 40 ? "var(--accent)"  : "var(--accent3)";

          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 90px 80px 80px 100px",
              gap: 12, padding: "13px 18px",
              borderBottom: "1px solid rgba(26,58,92,0.4)",
              alignItems: "center",
              transition: "background 0.1s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,212,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${riskColor}18`, border: `1px solid ${riskColor}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="ti ti-plug" style={{ color: riskColor, fontSize: 16 }} aria-hidden="true" />
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)" }}>{t.name}</span>
              </div>

              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: riskColor, marginBottom: 4 }}>{t.risk}</div>
                <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.risk}%`, background: riskColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                </div>
              </div>

              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)" }}>{t.calls}</span>

              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: t.blocked > 0 ? "var(--accent2)" : "var(--accent3)" }}>
                {t.blocked}
              </span>

              <RiskBadge level={level(t.risk)} />
            </div>
          );
        })}
      </Card>

      {/* Risk explanation */}
      <Card style={{ marginTop: 14 }}>
        <CardHeader title="RISK SCORING METHODOLOGY" icon="ti-info-circle" />
        <CardBody>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
            {[
              { label: "CRITICAL (80–100)", desc: "Direct code execution, payment, or credential access. Always blocked.", color: "var(--accent2)" },
              { label: "HIGH (60–79)",      desc: "Database writes, email sends, external communications. Requires policy approval.", color: "var(--warn)" },
              { label: "MEDIUM (40–59)",    desc: "CRM modifications, web fetches. Monitored and logged with warnings.", color: "var(--accent)" },
              { label: "LOW (0–39)",        desc: "Read-only operations, calendar reads. Allowed with audit trail.", color: "var(--accent3)" },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--bg)", border: `1px solid ${item.color}33`, borderRadius: 6, padding: 12, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: item.color, marginBottom: 5, letterSpacing: "0.5px" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
