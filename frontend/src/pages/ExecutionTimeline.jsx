import { useState } from "react";
import { Card, CardHeader, CardBody, SectionLabel } from "@/components/ui/Card";
import { DecisionBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { calculateRisk } from "@/utils/riskEngine";
import { ATTACK_EXAMPLES, PIPELINE_STEPS } from "@/utils/constants";
import { sleep } from "@/utils/helpers";

const STEP_DELAYS = [800, 900, 850, 1000, 950];

export default function ExecutionTimeline() {
  const [selectedAttack, setSelectedAttack] = useState("injection");
  const [running,        setRunning]        = useState(false);
  const [currentStep,    setCurrentStep]    = useState(-1);
  const [completedSteps, setCompleted]      = useState(new Set());
  const [decision,       setDecision]       = useState(null);

  const run = async () => {
    setRunning(true);
    setDecision(null);
    setCompleted(new Set());
    setCurrentStep(-1);

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setCurrentStep(i);
      await sleep(STEP_DELAYS[i]);
      setCompleted((prev) => new Set([...prev, i]));
    }

    const risk = calculateRisk(ATTACK_EXAMPLES[selectedAttack].prompt);
    setDecision(risk.score >= 50 ? "BLOCK" : risk.score >= 25 ? "WARN" : "ALLOW");
    setRunning(false);
  };

  const reset = () => {
    setCurrentStep(-1);
    setCompleted(new Set());
    setDecision(null);
  };

  const getNodeStyle = (stepId) => {
    const isDone    = completedSteps.has(stepId);
    const isActive  = currentStep === stepId && !isDone;
    const isDecision = stepId === 4 && decision;

    if (isDecision) {
      if (decision === "BLOCK") return { borderColor: "var(--accent2)", boxShadow: "0 0 16px rgba(255,64,96,0.28)" };
      if (decision === "WARN")  return { borderColor: "var(--warn)",    boxShadow: "0 0 16px rgba(255,184,0,0.25)" };
      return                           { borderColor: "var(--accent3)", boxShadow: "0 0 14px rgba(0,255,157,0.22)" };
    }
    if (isActive) return { borderColor: "var(--accent)", boxShadow: "0 0 14px rgba(0,212,255,0.28)" };
    if (isDone)   return { borderColor: "var(--accent3)" };
    return {};
  };

  const getIconColor = (stepId) => {
    if (completedSteps.has(stepId)) return "var(--accent3)";
    if (currentStep === stepId)     return "var(--accent)";
    return "var(--muted)";
  };

  return (
    <div>
      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="PIPELINE CONFIGURATION" icon="ti-settings" />
        <CardBody>
          <SectionLabel icon="ti-sword">SELECT ATTACK SCENARIO</SectionLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {Object.entries(ATTACK_EXAMPLES).map(([key, val]) => (
              <Button
                key={key}
                variant="ghost"
                size="sm"
                icon={val.icon}
                onClick={() => { setSelectedAttack(key); reset(); }}
                style={{
                  borderColor: selectedAttack === key ? "var(--accent)" : undefined,
                  color:       selectedAttack === key ? "var(--accent)" : undefined,
                }}
              >
                {key.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Selected prompt preview */}
          <div style={{
            background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 5,
            padding: "10px 12px", fontFamily: "var(--mono)", fontSize: 11,
            color: "var(--muted)", marginBottom: 14, lineHeight: 1.6,
          }}>
            {ATTACK_EXAMPLES[selectedAttack].prompt.slice(0, 120)}…
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="primary" icon="ti-player-play" loading={running} disabled={running} onClick={run}>
              {running ? "SIMULATING…" : "RUN PIPELINE"}
            </Button>
            <Button variant="ghost" icon="ti-refresh" disabled={running} onClick={reset}>RESET</Button>
          </div>
        </CardBody>
      </Card>

      {/* Pipeline steps */}
      <Card>
        <CardHeader title="AGENT EXECUTION PIPELINE" icon="ti-sitemap" />
        <CardBody>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, maxWidth: 460, margin: "0 auto" }}>
            {PIPELINE_STEPS.map((step, idx) => (
              <div key={step.id} style={{ width: "100%" }}>
                <div
                  className="flow-node"
                  style={{
                    border: `1px solid ${getNodeStyle(step.id).borderColor ?? "var(--border)"}`,
                    boxShadow: getNodeStyle(step.id).boxShadow,
                    animationPlayState: currentStep === step.id ? "running" : "paused",
                  }}
                >
                  <div style={{ marginBottom: 6 }}>
                    {currentStep === step.id && !completedSteps.has(step.id) ? (
                      <div className="spinner" style={{ margin: "0 auto", width: 22, height: 22 }} />
                    ) : (
                      <i
                        className={`ti ${step.icon}`}
                        style={{ fontSize: 24, color: getIconColor(step.id) }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 3 }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{step.desc}</div>

                  {/* Decision result on last step */}
                  {step.id === 4 && decision && (
                    <div style={{ marginTop: 10 }}>
                      <DecisionBadge decision={decision} style={{ fontSize: 13, padding: "5px 18px" }} />
                    </div>
                  )}

                  {/* Completed tick */}
                  {completedSteps.has(step.id) && step.id !== 4 && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--accent3)", marginTop: 4 }}>
                      ✓ COMPLETE
                    </div>
                  )}
                </div>

                {/* Arrow connector */}
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div style={{ textAlign: "center", padding: "5px 0", color: completedSteps.has(step.id) ? "var(--accent3)" : "var(--muted)" }}>
                    <i className="ti ti-arrow-down" style={{ fontSize: 16 }} aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
