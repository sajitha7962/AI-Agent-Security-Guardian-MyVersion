import { useState } from "react";
import { Card, CardHeader, CardBody, SectionLabel } from "@/components/ui/Card";
import { DecisionBadge, RiskBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ScoreBar from "@/components/ui/ScoreBar";
import { calculateRisk, scoreToDecision } from "@/utils/riskEngine";
import { AGENT_ACTIONS, DEFAULT_POLICIES, POLICY_ACTION_MAP } from "@/utils/constants";
import { useGuardianStore } from "@/hooks/useGuardianStore";
import { sleep } from "@/utils/helpers";

function riskColor(risk) {
  return risk >= 70 ? "var(--accent2)" : risk >= 50 ? "var(--warn)" : "var(--accent3)";
}

export default function ActionMonitor() {
  const addStats        = useGuardianStore((s) => s.addStats);
  const addLog          = useGuardianStore((s) => s.addLog);
  const setNotification = useGuardianStore((s) => s.setNotification);

  const [context,  setContext]  = useState("Transfer $5,000 to vendor account for invoice #1234");
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);

  const evaluate = async (action) => {
    setSelected(action.id);
    setLoading(true);
    setResult(null);
    await sleep(900);

    const contextRisk   = calculateRisk(context);
    const policyId      = POLICY_ACTION_MAP[action.id];
    const policyBlocked = policyId
      ? DEFAULT_POLICIES.find((p) => p.id === policyId && p.enabled)
      : null;

    const combinedScore = Math.min(action.risk * 0.6 + contextRisk.score * 0.4, 100);
    const decision      = scoreToDecision(combinedScore, action.risk, !!policyBlocked);

    const res = {
      action,
      decision,
      riskScore:     Math.round(combinedScore),
      contextScore:  contextRisk.score,
      policyBlocked,
      threats:       contextRisk.threats,
    };

    setResult(res);
    setLoading(false);

    addStats({ score: combinedScore, threats: contextRisk.threats });
    addLog({
      time:     new Date().toLocaleTimeString(),
      prompt:   `${action.label}: ${context.slice(0, 50)}`,
      action:   action.label,
      score:    combinedScore,
      decision,
      threat:   contextRisk.threats[0]?.type || "None",
    });

    if (decision === "BLOCK") {
      setNotification({ type: "threat", msg: `Action BLOCKED: ${action.label}` });
    } else {
      setNotification({ type: "safe", msg: `Action ${decision}: ${action.label}` });
    }
  };

  return (
    <div>
      {/* Context */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="AGENT CONTEXT" icon="ti-message" />
        <CardBody>
          <SectionLabel icon="ti-pencil">ACTION INTENT / CONTEXT</SectionLabel>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "10px 14px",
              fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)",
              outline: "none", width: "100%", minHeight: 72, resize: "vertical",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
          />
        </CardBody>
      </Card>

      {/* Action grid */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="SELECT AGENT ACTION" icon="ti-robot" />
        <CardBody>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AGENT_ACTIONS.map((a) => (
              <button
                key={a.id}
                className="attack-btn"
                disabled={loading}
                onClick={() => evaluate(a)}
                style={{
                  borderColor: selected === a.id ? "var(--accent)" : undefined,
                  background:  selected === a.id ? "rgba(0,212,255,0.07)" : undefined,
                }}
              >
                {loading && selected === a.id ? (
                  <div className="spinner" style={{ width: 16, height: 16 }} />
                ) : (
                  <i className={`ti ${a.icon}`} style={{ fontSize: 17, color: riskColor(a.risk), flexShrink: 0 }} aria-hidden="true" />
                )}
                <span style={{ flex: 1 }}>{a.label}</span>
                <RiskBadge level={a.risk >= 70 ? "HIGH" : a.risk >= 50 ? "MEDIUM" : "LOW"} />
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Decision result */}
      {result && !loading && (
        <Card style={{ animation: "fadeIn 0.35s ease" }}>
          <CardHeader
            title="SECURITY DECISION"
            icon="ti-gavel"
            right={<DecisionBadge decision={result.decision} />}
          />
          <CardBody>
            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { val: result.decision, sub: "Decision", color: result.decision === "ALLOW" ? "var(--accent3)" : result.decision === "WARN" ? "var(--warn)" : "var(--accent2)" },
                { val: result.riskScore, sub: "Combined Score", color: "var(--accent)" },
                { val: result.action.label, sub: "Action", color: "#fff" },
              ].map((kpi, i) => (
                <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 14, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 18, color: kpi.color, marginBottom: 4 }}>{kpi.val}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            <ScoreBar label="ACTION RISK" value={result.action.risk} style={{ marginBottom: 8 }} />
            <ScoreBar label="CONTEXT RISK" value={result.contextScore} style={{ marginBottom: 16 }} />

            {/* Policy block reason */}
            {result.policyBlocked && (
              <div style={{ background: "rgba(255,64,96,0.07)", border: "1px solid rgba(255,64,96,0.22)", borderRadius: 6, padding: 12, marginBottom: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <i className="ti ti-shield-x" style={{ color: "var(--accent2)", fontSize: 18, marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent2)", marginBottom: 3 }}>Policy Violation</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{result.policyBlocked.label} — {result.policyBlocked.desc}</div>
                </div>
              </div>
            )}

            {/* Threat indicators */}
            {result.threats.length > 0 && (
              <>
                <SectionLabel icon="ti-alert-triangle">THREAT INDICATORS</SectionLabel>
                {result.threats.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5, padding: "8px 12px", marginBottom: 5, fontSize: 11 }}>
                    <i className="ti ti-alert-triangle" style={{ color: "var(--warn)", flexShrink: 0 }} aria-hidden="true" />
                    {t.type}
                    <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>+{t.score} pts</span>
                  </div>
                ))}
              </>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
