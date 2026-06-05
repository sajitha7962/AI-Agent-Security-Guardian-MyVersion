import { Card, CardHeader, CardBody, SectionLabel } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { TrustMeter } from "@/components/ui/ScoreBar";
import StatCard from "@/components/ui/StatCard";
import { AGENTS } from "@/utils/constants";
import { trustColor, trustLabel } from "@/utils/helpers";
import { useGuardianStore } from "@/hooks/useGuardianStore";

const TRUST_FACTORS = [
  { label: "Past Violations",    weight: 30, desc: "Historical security policy breaches" },
  { label: "Risk History",       weight: 25, desc: "Average risk score over past 30 days" },
  { label: "Policy Compliance",  weight: 25, desc: "Adherence to defined security policies" },
  { label: "Successful Actions", weight: 20, desc: "Ratio of allowed vs blocked operations" },
];

function AgentTrustCard({ agent }) {
  const color = trustColor(agent.trust);
  const label = trustLabel(agent.trust);

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 8, padding: 18, borderTop: `2px solid ${color}`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <i className="ti ti-robot" style={{ color, fontSize: 22 }} aria-hidden="true" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{agent.name}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "1px", marginTop: 2 }}>
            {agent.role.toUpperCase()}
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Trust gauge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <TrustMeter score={agent.trust} size="lg" />
      </div>

      {/* Factor bars */}
      {TRUST_FACTORS.map((f, i) => {
        // Simulate per-factor scores
        const factorScore = Math.max(0, Math.min(100,
          agent.trust + (Math.sin(agent.id.charCodeAt(1) + i) * 12)
        ));
        const fc = trustColor(factorScore);
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "var(--text)" }}>{f.label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: fc }}>
                {Math.round(factorScore)}
              </span>
            </div>
            <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${factorScore}%`, background: fc, borderRadius: 2, transition: "width 1s ease" }} />
            </div>
          </div>
        );
      })}

      {/* Summary */}
      <div style={{ marginTop: 12, padding: "8px 10px", background: `${color}0d`, border: `1px solid ${color}30`, borderRadius: 5, fontFamily: "var(--mono)", fontSize: 10, color }}>
        STATUS: {label} · {agent.violations} VIOLATIONS
      </div>
    </div>
  );
}

export default function TrustEngine() {
  const systemTrust = useGuardianStore((s) => s.systemTrust);
  const avgTrust    = Math.round(AGENTS.reduce((s, a) => s + a.trust, 0) / AGENTS.length);
  const trusted     = AGENTS.filter((a) => a.trust >= 80).length;
  const restricted  = AGENTS.filter((a) => a.trust < 60).length;

  return (
    <div>
      {/* System summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard num={systemTrust} label="System Trust Score" accent="green" icon="ti-shield-star"
          delta={systemTrust >= 80 ? "Healthy" : systemTrust >= 60 ? "Monitor" : "At Risk"} deltaType={systemTrust >= 70 ? "down" : "up"} />
        <StatCard num={avgTrust}   label="Avg Agent Trust"    accent="blue"  icon="ti-robot"       delta="Across all agents" />
        <StatCard num={trusted}    label="Trusted Agents"     accent="green" icon="ti-circle-check" delta="Score ≥ 80" deltaType="down" />
        <StatCard num={restricted} label="At-Risk Agents"     accent="red"   icon="ti-alert-triangle" delta="Score < 60" deltaType="up" />
      </div>

      {/* How scoring works */}
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title="TRUST SCORING METHODOLOGY" icon="ti-info-circle" />
        <CardBody>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            {TRUST_FACTORS.map((f, i) => (
              <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{f.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)" }}>{f.weight}%</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</div>
                <div style={{ height: 3, background: "var(--border)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${f.weight * 3}%`, background: "var(--accent)", borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Per-agent cards */}
      <SectionLabel icon="ti-robot">AGENT TRUST SCORES</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 12 }}>
        {AGENTS.map((a) => (
          <AgentTrustCard key={a.id} agent={a} />
        ))}
      </div>
    </div>
  );
}
