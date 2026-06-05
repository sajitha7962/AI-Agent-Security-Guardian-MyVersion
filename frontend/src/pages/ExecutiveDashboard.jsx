import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import SparkLine from "@/components/charts/SparkLine";
import { useGuardianStore } from "@/hooks/useGuardianStore";
import { COMPLIANCE_ITEMS } from "@/utils/constants";

export default function ExecutiveDashboard() {
  const stats = useGuardianStore((s) => s.stats);

  const prevented  = stats.threats + 247;
  const costSaved  = prevented * 4800;
  const riskRed    = Math.min(92 + stats.threats, 99);
  const compliance = Math.min(87 + stats.safe, 99);

  const kpis = [
    { num: prevented,               fmt: String(prevented),       lbl: "Threats Prevented",    trend: "+23% this month",       icon: "ti-shield-check", color: "var(--accent3)" },
    { num: costSaved,               fmt: `$${costSaved.toLocaleString()}`, lbl: "Estimated Cost Saved", trend: "Avg $4.8K per breach", icon: "ti-coin",         color: "var(--accent)"  },
    { num: riskRed,                 fmt: `${riskRed}%`,           lbl: "Risk Reduction",       trend: "+8% vs last quarter",   icon: "ti-trending-down", color: "var(--accent3)" },
    { num: compliance,              fmt: `${compliance}%`,        lbl: "Agent Compliance",     trend: "Above industry avg",    icon: "ti-certificate",  color: "var(--accent)"  },
    { num: 340 - stats.threats * 2, fmt: `${Math.max(340 - stats.threats * 2, 280)}ms`, lbl: "Avg Response Time", trend: "P99 < 500ms",     icon: "ti-clock",        color: "var(--accent)"  },
    { num: 99.7,                    fmt: "99.8%",                 lbl: "Platform Uptime",      trend: "SLA compliant ✓",       icon: "ti-activity",     color: "var(--accent3)" },
  ];

  const roiTrend = [12, 18, 15, 25, 22, 30, 28, 35, 33, 40, 38, 45 + stats.threats];

  return (
    <div>
      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "3px", marginBottom: 8 }}>
          EXECUTIVE OVERVIEW
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: "-0.5px" }}>
          AI Agent Security <span style={{ color: "var(--accent)" }}>ROI Dashboard</span>
        </h1>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "1px" }}>
          REAL-TIME SECURITY PERFORMANCE METRICS
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <div key={i} className="exec-kpi">
            <div style={{ marginBottom: 10 }}>
              <i className={`ti ${k.icon}`} style={{ fontSize: 24, color: k.color }} aria-hidden="true" />
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 30, color: k.color, marginBottom: 4 }}>
              {k.fmt}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{k.lbl}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: k.color, opacity: 0.75 }}>{k.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <CardHeader title="SECURITY ROI TREND" icon="ti-chart-line" />
          <CardBody>
            <SparkLine data={roiTrend} color="#00ff9d" height={80} label="MONTHLY THREAT PREVENTION RATE (%)" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="COMPLIANCE POSTURE" icon="ti-certificate" />
          <CardBody>
            {COMPLIANCE_ITEMS.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "var(--text)", width: 120, flexShrink: 0 }}>{c.label}</span>
                <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.score}%`, background: c.color, borderRadius: 2, transition: "width 1s ease" }} />
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: c.color, width: 36, textAlign: "right" }}>
                  {c.score}%
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Business impact table */}
      <Card>
        <CardHeader title="BUSINESS IMPACT SUMMARY" icon="ti-report-analytics" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          {[
            { category: "Security",    items: ["Zero successful breaches", "99.8% uptime maintained", "All OWASP LLM controls active"] },
            { category: "Compliance",  items: ["SOC 2 Type II: 91%", "GDPR compliant: 94%", "NIST AI RMF: 83%"] },
            { category: "Operations",  items: ["< 400ms avg latency", "200+ agents monitored", "Real-time policy enforcement"] },
          ].map((col, i) => (
            <div key={i} style={{ padding: "16px 20px", borderRight: i < 2 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--accent)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
                {col.category}
              </div>
              {col.items.map((item, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, color: "var(--text)" }}>
                  <i className="ti ti-circle-check" style={{ color: "var(--accent3)", fontSize: 14, flexShrink: 0 }} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
