import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DecisionBadge, RiskBadge } from "@/components/ui/Badge";
import { LiveBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { calculateRisk } from "@/utils/riskEngine";
import { ATTACK_EXAMPLES } from "@/utils/constants";
import { useGuardianStore } from "@/hooks/useGuardianStore";
import { sleep } from "@/utils/helpers";

export default function AttackSimulator() {
  const addStats        = useGuardianStore((s) => s.addStats);
  const addLog          = useGuardianStore((s) => s.addLog);
  const setNotification = useGuardianStore((s) => s.setNotification);

  const [running,  setRunning]  = useState(null); // key of running attack
  const [results,  setResults]  = useState([]);
  const [runningAll, setRunAll] = useState(false);

  const runAttack = async (key) => {
    setRunning(key);
    await sleep(1200 + Math.random() * 400);

    const { label, icon, prompt } = ATTACK_EXAMPLES[key];
    const risk     = calculateRisk(prompt);
    const decision = risk.score >= 50 ? "BLOCK" : risk.score >= 25 ? "WARN" : "ALLOW";
    const time     = new Date().toLocaleTimeString();

    const entry = { key, label, icon, prompt: prompt.slice(0, 70) + "…", risk, decision, time };
    setResults((r) => [entry, ...r].slice(0, 20));

    addStats(risk);
    addLog({ time, prompt: entry.prompt, action: label, score: risk.score, decision, threat: risk.threats[0]?.type || "Unknown" });
    setNotification({ type: "threat", msg: `${label} — Score: ${risk.score}/100 — ${decision}` });
    setRunning(null);
    return entry;
  };

  const runAll = async () => {
    setRunAll(true);
    for (const key of Object.keys(ATTACK_EXAMPLES)) {
      await runAttack(key);
      await sleep(300);
    }
    setRunAll(false);
  };

  const clearResults = () => setResults([]);

  const attackKeys = Object.keys(ATTACK_EXAMPLES);

  return (
    <div>
      {/* Header warning banner */}
      <div style={{
        background: "rgba(255,64,96,0.07)", border: "1px solid rgba(255,64,96,0.22)",
        borderRadius: 8, padding: "12px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <i className="ti ti-alert-triangle" style={{ color: "var(--accent2)", fontSize: 20, flexShrink: 0 }} aria-hidden="true" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent2)", marginBottom: 2 }}>RED TEAM MODE ACTIVE</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
            Simulated attacks only. All prompts are analysed and blocked by the Guardian.
          </div>
        </div>
      </div>

      {/* Attack buttons */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader
          title="LIVE ATTACK SIMULATOR"
          icon="ti-sword"
          right={
            <Button variant="danger" size="sm" icon="ti-player-play" loading={runningAll} disabled={runningAll || running !== null} onClick={runAll}>
              RUN ALL
            </Button>
          }
        />
        <CardBody>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {attackKeys.map((key) => {
              const a          = ATTACK_EXAMPLES[key];
              const isRunning  = running === key;
              const isDisabled = running !== null || runningAll;
              return (
                <button
                  key={key}
                  className="attack-btn"
                  disabled={isDisabled}
                  onClick={() => runAttack(key)}
                >
                  {isRunning
                    ? <div className="spinner" style={{ width: 16, height: 16, flexShrink: 0 }} />
                    : <i className={`ti ${a.icon}`} style={{ fontSize: 18, color: "var(--accent2)", flexShrink: 0 }} aria-hidden="true" />
                  }
                  {a.label}
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader
            title="ATTACK RESULTS"
            icon="ti-history"
            right={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LiveBadge />
                <Button variant="ghost" size="sm" icon="ti-trash" onClick={clearResults}>CLEAR</Button>
              </div>
            }
          />
          {results.map((r, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 18px", borderBottom: "1px solid rgba(26,58,92,0.4)",
              animation: "slideIn 0.35s ease",
            }}>
              <i className={`ti ${r.icon}`} style={{ color: "var(--accent2)", fontSize: 18, flexShrink: 0 }} aria-hidden="true" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: 12, marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.prompt}
                </div>
              </div>

              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: r.risk.color, marginBottom: 4 }}>
                  {r.risk.score}/100
                </div>
                <DecisionBadge decision={r.decision} style={{ fontSize: 9, padding: "1px 7px" }} />
              </div>

              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", flexShrink: 0, minWidth: 52 }}>
                {r.time}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
