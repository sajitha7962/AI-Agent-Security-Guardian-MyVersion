import { useGuardianStore } from "@/hooks/useGuardianStore";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import { LiveBadge } from "@/components/ui/Badge";
import SparkLine from "@/components/charts/SparkLine";
import MiniBar from "@/components/charts/MiniBar";
import RadarChart from "@/components/charts/RadarChart";
import { THREAT_FEED, COMPLIANCE_ITEMS } from "@/utils/constants";

export default function Dashboard() {
  const stats = useGuardianStore((s) => s.stats);

  const trendData = [8, 12, 7, 22, 15, 30, 25, 18, 35, 28, 40, stats.threats + 4];
  const catData   = [stats.injections, stats.jailbreaks, stats.exfil, stats.toolAbuse];

  const radarScores = {
    INJECT: Math.min(stats.injections * 12 + 10, 100),
    JAILBK: Math.min(stats.jailbreaks * 15 + 8,  100),
    EXFIL:  Math.min(stats.exfil      * 14 + 6,  100),
    PRIV:   34,
    RAG:    56,
    TOOLS:  Math.min(stats.toolAbuse  * 10 + 20, 100),
  };

  return (
    <div>
      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard num={stats.total}      label="Total Requests"   delta={`+${stats.total} this session`}            deltaType="up"   accent="blue"  icon="ti-activity" />
        <StatCard num={stats.threats}    label="Threats Blocked"  delta={`${stats.total ? Math.round((stats.threats/stats.total)*100) : 0}% block rate`} deltaType="up" accent="red"   icon="ti-shield-x" />
        <StatCard num={stats.injections} label="Prompt Injections" delta="Most common threat"                        deltaType="up"   accent="warn"  icon="ti-arrow-bounce" />
        <StatCard num={stats.safe}       label="Safe Requests"    delta="System healthy ✓"                           deltaType="down" accent="green" icon="ti-shield-check" />
        <StatCard num={stats.jailbreaks} label="Jailbreak Attempts" delta="High severity"                            deltaType="up"   accent="red"   icon="ti-lock-open" />
        <StatCard num={stats.exfil}      label="Data Leak Events" delta="Prevented"                                  deltaType="up"   accent="warn"  icon="ti-database-export" />
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <CardHeader title="THREAT TIMELINE" icon="ti-chart-line" />
          <CardBody>
            <SparkLine data={trendData} color="#ff4060" label="LAST 12 REQUESTS" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="SEVERITY DISTRIBUTION" icon="ti-chart-bar" />
          <CardBody>
            <MiniBar
              data={catData}
              colors={["#ff4060", "#ff607a", "#ffb800", "#00d4ff"]}
              labels={["Injections", "Jailbreaks", "Exfil", "Tool Abuse"]}
            />
          </CardBody>
        </Card>
      </div>

      {/* ── Threat feed ── */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader title="LIVE THREAT FEED" icon="ti-radar-2" right={<LiveBadge />} />
        {THREAT_FEED.slice(0, 6).map((f, i) => (
          <div key={i} className="feed-item">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.prompt}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>
                {f.type} · {f.time}
              </div>
            </div>
            <RiskBadge level={f.severity.toUpperCase()} style={{ marginLeft: 12, flexShrink: 0 }} />
          </div>
        ))}
      </Card>

      {/* ── Radar + Compliance ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card>
          <CardHeader title="SECURITY RADAR" icon="ti-radar" />
          <CardBody style={{ display: "flex", justifyContent: "center" }}>
            <RadarChart scores={radarScores} size={220} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="COMPLIANCE POSTURE" icon="ti-certificate" />
          <CardBody>
            {COMPLIANCE_ITEMS.map((c, i) => (
              <div key={i} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--text)" }}>{c.label}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: c.color }}>{c.score}%</span>
                </div>
                <div className="compliance-bar">
                  <div className="compliance-fill" style={{ width: `${c.score}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
