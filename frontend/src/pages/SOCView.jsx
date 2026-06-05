import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { RiskBadge, StatusBadge, LiveBadge } from "@/components/ui/Badge";
import StatCard from "@/components/ui/StatCard";
import { TrustMeter } from "@/components/ui/ScoreBar";
import { SOC_INCIDENTS, AGENTS, SEV_COLOR } from "@/utils/constants";
import { trustColor } from "@/utils/helpers";

const HEATMAP = [
  { label: "Prompt Injection",    val: 78, color: "var(--accent2)" },
  { label: "Jailbreak",           val: 55, color: "var(--accent2)" },
  { label: "Data Exfiltration",   val: 62, color: "var(--warn)"    },
  { label: "Tool Abuse",          val: 44, color: "var(--warn)"    },
  { label: "RAG Poisoning",       val: 38, color: "var(--accent)"  },
  { label: "Privilege Escalation",val: 29, color: "var(--accent3)" },
];

export default function SOCView() {
  const active        = SOC_INCIDENTS.filter((i) => i.status === "active").length;
  const critical      = SOC_INCIDENTS.filter((i) => i.severity === "critical").length;
  const investigating = SOC_INCIDENTS.filter((i) => i.status === "investigating").length;
  const resolved      = SOC_INCIDENTS.filter((i) => i.status === "resolved").length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard num={active}        label="Active Incidents"    accent="red"   icon="ti-alert-circle"   delta="Requires action" deltaType="up" />
        <StatCard num={critical}      label="Critical Threats"    accent="red"   icon="ti-bomb"           delta="Highest priority" deltaType="up" />
        <StatCard num={investigating} label="Under Investigation" accent="warn"  icon="ti-search"         delta="In progress" deltaType="up" />
        <StatCard num={resolved}      label="Resolved Today"      accent="green" icon="ti-circle-check"   delta="Closed out" deltaType="down" />
      </div>

      {/* Live incidents */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader title="LIVE INCIDENTS" icon="ti-alert-circle" right={<LiveBadge />} />
        {SOC_INCIDENTS.map((inc, i) => (
          <div key={i} className="incident-row">
            <div className="inc-sev" style={{ background: SEV_COLOR[inc.severity] ?? "var(--muted)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{inc.id}</span>
                <RiskBadge level={inc.severity.toUpperCase()} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{inc.title}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
                Agent: {inc.agent} · {inc.time}
              </div>
            </div>
            <StatusBadge status={inc.status} />
          </div>
        ))}
      </Card>

      {/* Heatmap + Top Agents */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <CardHeader title="THREAT HEATMAP" icon="ti-chart-donut" />
          <CardBody>
            {HEATMAP.map((t, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: "var(--text)" }}>{t.label}</span>
                  <span style={{ fontFamily: "var(--mono)", color: t.color }}>{t.val}%</span>
                </div>
                <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${t.val}%`, background: t.color, borderRadius: 3, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="TOP THREAT AGENTS" icon="ti-users" />
          <CardBody>
            {[...AGENTS].sort((a, b) => b.violations - a.violations).map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <i className="ti ti-robot" style={{ color: a.violations >= 8 ? "var(--accent2)" : "var(--muted)", fontSize: 18 }} aria-hidden="true" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{a.name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>
                    {a.violations} violations · {a.role}
                  </div>
                </div>
                <TrustMeter score={a.trust} />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
