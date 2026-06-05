import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DecisionBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { calculateRisk } from "@/utils/riskEngine";
import { ATTACK_EXAMPLES } from "@/utils/constants";
import { useGuardianStore } from "@/hooks/useGuardianStore";
import { sleep } from "@/utils/helpers";

const PHASES = [
  { id: 0, label: "Initialising Security Guardian",        icon: "ti-shield",         color: "var(--accent)"  },
  { id: 1, label: "Receiving Prompt Injection Attack",     icon: "ti-arrow-bounce",   color: "var(--accent2)" },
  { id: 2, label: "Parsing Agent Intent",                  icon: "ti-brain",          color: "var(--warn)"    },
  { id: 3, label: "Running Threat Vector Analysis",        icon: "ti-scan",           color: "var(--warn)"    },
  { id: 4, label: "Calculating Risk Score",                icon: "ti-calculator",     color: "var(--accent2)" },
  { id: 5, label: "Evaluating Security Policies",          icon: "ti-lock",           color: "var(--accent)"  },
  { id: 6, label: "THREAT BLOCKED — Generating Audit Log", icon: "ti-shield-check",  color: "var(--accent3)" },
  { id: 7, label: "Dashboard & Statistics Updated",        icon: "ti-chart-bar",      color: "var(--accent3)" },
];

export default function DemoMode() {
  const navigate        = useNavigate();
  const addStats        = useGuardianStore((s) => s.addStats);
  const addLog          = useGuardianStore((s) => s.addLog);
  const setNotification = useGuardianStore((s) => s.setNotification);

  const [running,   setRunning]   = useState(false);
  const [phases,    setPhases]    = useState([]);
  const [complete,  setComplete]  = useState(false);
  const [riskScore, setRiskScore] = useState(null);

  const runDemo = async () => {
    setRunning(true);
    setComplete(false);
    setPhases([]);
    setRiskScore(null);

    for (let i = 0; i < PHASES.length; i++) {
      setPhases((prev) => [...prev, { ...PHASES[i], done: false }]);
      await sleep(850 + Math.random() * 200);
      setPhases((prev) => prev.map((p, j) => j === i ? { ...p, done: true } : p));
    }

    const risk = calculateRisk(ATTACK_EXAMPLES.injection.prompt);
    setRiskScore(risk.score);
    addStats(risk);
    addLog({
      time:     new Date().toLocaleTimeString(),
      prompt:   "DEMO: " + ATTACK_EXAMPLES.injection.prompt.slice(0, 60),
      action:   "Demo — Prompt Injection",
      score:    risk.score,
      decision: "BLOCK",
      threat:   "Prompt Injection",
    });
    setNotification({ type: "threat", msg: "Demo complete: Prompt injection blocked (Score: " + risk.score + "/100)" });

    setComplete(true);
    setRunning(false);
  };

  const reset = () => {
    setPhases([]);
    setComplete(false);
    setRiskScore(null);
  };

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "3px", marginBottom: 10 }}>
          HACKATHON DEMO MODE
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.5px" }}>
          One-Click <span style={{ color: "var(--accent)" }}>Judge Demo</span>
        </h1>
        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8 }}>
          Watch the complete AI Agent Security Guardian pipeline in action — from
          attack detection through risk scoring, policy evaluation, and real-time
          dashboard update.
        </p>
      </div>

      {/* Demo trigger */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
        <Button
          variant="primary"
          size="lg"
          icon="ti-player-play"
          loading={running}
          disabled={running}
          onClick={runDemo}
          style={{ animation: running ? "none" : "glow 2s ease-in-out infinite" }}
        >
          {running ? "DEMO RUNNING…" : "START FULL DEMO"}
        </Button>
        {!running && phases.length > 0 && (
          <Button variant="ghost" size="lg" icon="ti-refresh" onClick={reset}>RESET</Button>
        )}
      </div>

      {/* Attack preview */}
      {phases.length > 0 && (
        <div style={{
          background: "rgba(255,64,96,0.06)", border: "1px solid rgba(255,64,96,0.2)",
          borderRadius: 8, padding: "12px 16px", marginBottom: 20,
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", lineHeight: 1.7,
        }}>
          <span style={{ color: "var(--accent2)", marginRight: 8 }}>ATTACK PROMPT:</span>
          {ATTACK_EXAMPLES.injection.prompt.slice(0, 100)}…
        </div>
      )}

      {/* Phase log */}
      {phases.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <CardHeader title="PIPELINE EXECUTION LOG" icon="ti-list" />
          <CardBody>
            {phases.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, animation: "slideIn 0.35s ease" }}>
                {/* Icon circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: p.done ? `${p.color}18` : "var(--surface2)",
                  border: `1px solid ${p.done ? p.color : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.3s",
                }}>
                  {p.done
                    ? <i className={`ti ${p.icon}`} style={{ color: p.color, fontSize: 18 }} aria-hidden="true" />
                    : <div className="spinner" style={{ width: 15, height: 15 }} />
                  }
                </div>

                {/* Label */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: p.done ? "#fff" : "var(--muted)", transition: "color 0.3s" }}>
                    {p.label}
                  </div>
                  {p.done && (
                    <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: p.color, marginTop: 2, letterSpacing: "1px" }}>
                      ✓ COMPLETE
                    </div>
                  )}
                </div>

                {/* Special risk score on phase 4 */}
                {p.id === 4 && p.done && riskScore !== null && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--accent2)", fontWeight: 700 }}>
                    {riskScore}/100
                  </div>
                )}

                {/* Decision on last phase */}
                {p.id === 6 && p.done && (
                  <DecisionBadge decision="BLOCK" style={{ fontSize: 11 }} />
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Completion state */}
      {complete && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <div style={{
            background: "rgba(0,255,157,0.05)", border: "1px solid rgba(0,255,157,0.2)",
            borderRadius: 10, padding: 24, textAlign: "center", marginBottom: 20,
          }}>
            <i className="ti ti-shield-check" style={{ fontSize: 40, color: "var(--accent3)" }} aria-hidden="true" />
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent3)", marginTop: 10, marginBottom: 6 }}>
              ATTACK SUCCESSFULLY BLOCKED
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "1px" }}>
              THREAT LOGGED · DASHBOARD UPDATED · AUDIT TRAIL CREATED · RISK SCORE: {riskScore}/100
            </div>
          </div>

          {/* Navigation shortcuts */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "View Dashboard",   to: "/dashboard",  icon: "ti-layout-dashboard" },
              { label: "View Audit Log",   to: "/audit",      icon: "ti-clipboard-list"   },
              { label: "Try Firewall",     to: "/firewall",   icon: "ti-shield-bolt"      },
              { label: "Run Simulator",    to: "/simulator",  icon: "ti-sword"            },
              { label: "Executive View",   to: "/executive",  icon: "ti-chart-bar"        },
            ].map((link, i) => (
              <Button key={i} variant="ghost" icon={link.icon} onClick={() => navigate(link.to)}>
                {link.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
