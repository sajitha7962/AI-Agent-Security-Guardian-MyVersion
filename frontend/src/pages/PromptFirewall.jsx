import { useState } from "react";
import { Card, CardHeader, CardBody, SectionLabel } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ThreatCard from "@/components/ui/ThreatCard";
import { calculateRisk } from "@/utils/riskEngine";
import { ATTACK_EXAMPLES } from "@/utils/constants";
import { useGuardianStore } from "@/hooks/useGuardianStore";
import { sleep } from "@/utils/helpers";

// Calls backend (or falls back to local if backend unavailable)
async function fetchAIExplanation(prompt, threats, score) {
  try {
    const res = await fetch("/api/firewall/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, threats: threats.map((t) => t.type), score }),
    });
    if (!res.ok) throw new Error("backend unavailable");
    const data = await res.json();
    return data.explanation;
  } catch {
    // Fallback: call Anthropic directly via the artifact API pattern
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: "You are an AI security analyst. Given a flagged prompt, explain in 2-3 concise sentences: why it was flagged, what the actual danger is, and suggest a safe alternative phrasing. Be direct and technical.",
          messages: [{ role: "user", content: `Prompt: "${prompt}"\nDetected: ${threats.map((t) => t.type).join(", ")}\nScore: ${score}/100` }],
        }),
      });
      const d = await res.json();
      return d.content?.map((b) => b.text || "").join("") || "Explanation unavailable.";
    } catch {
      return "AI explanation service is currently unavailable.";
    }
  }
}

export default function PromptFirewall() {
  const addStats       = useGuardianStore((s) => s.addStats);
  const addLog         = useGuardianStore((s) => s.addLog);
  const setNotification = useGuardianStore((s) => s.setNotification);

  const [prompt,      setPrompt]     = useState("");
  const [loading,     setLoading]    = useState(false);
  const [result,      setResult]     = useState(null);
  const [aiExplain,   setAiExplain]  = useState("");
  const [aiLoading,   setAiLoading]  = useState(false);

  const analyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setAiExplain("");
    await sleep(800); // Simulate processing
    const risk = calculateRisk(prompt);
    setResult(risk);
    setLoading(false);

    // Update global stats & log
    addStats(risk);
    addLog({
      time:     new Date().toLocaleTimeString(),
      prompt:   prompt.slice(0, 80),
      action:   "Prompt Analysis",
      score:    risk.score,
      decision: risk.score >= 50 ? "BLOCK" : risk.score >= 25 ? "WARN" : "ALLOW",
      threat:   risk.threats[0]?.type || "None",
    });

    if (risk.score >= 50) {
      setNotification({ type: "threat", msg: `${risk.level} threat: ${risk.threats[0]?.type ?? "Unknown"} (${risk.score}/100)` });
    }

    // Fetch AI explanation in parallel
    setAiLoading(true);
    const exp = await fetchAIExplanation(prompt, risk.threats, risk.score);
    setAiExplain(exp);
    setAiLoading(false);
  };

  const loadAttack = (key) => {
    setPrompt(ATTACK_EXAMPLES[key].prompt);
    setResult(null);
    setAiExplain("");
  };

  return (
    <div>
      {/* ── Input card ── */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="AI PROMPT FIREWALL" icon="ti-shield-bolt" />
        <CardBody>
          <SectionLabel icon="ti-terminal">ENTER PROMPT TO ANALYZE</SectionLabel>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter any AI agent prompt to analyze for threats, injections, jailbreaks…"
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "10px 14px",
              fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)",
              outline: "none", width: "100%", minHeight: 100,
              resize: "vertical", marginBottom: 12,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
          />

          {/* Quick-load attack examples */}
          <div style={{ marginBottom: 14 }}>
            <SectionLabel icon="ti-sword">QUICK LOAD ATTACK EXAMPLE</SectionLabel>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {Object.entries(ATTACK_EXAMPLES).map(([key, val]) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  icon={val.icon}
                  onClick={() => loadAttack(key)}
                >
                  {val.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            icon="ti-scan"
            loading={loading}
            disabled={loading || !prompt.trim()}
            onClick={analyze}
          >
            {loading ? "ANALYZING…" : "ANALYZE PROMPT"}
          </Button>
        </CardBody>
      </Card>

      {/* ── Result card ── */}
      {(loading || result) && (
        <Card>
          <CardHeader
            title="ANALYSIS RESULT"
            icon="ti-shield-check"
            right={result ? <RiskBadge level={result.level} /> : null}
          />
          <CardBody>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", padding: 8 }}>
                <div className="spinner" /> Running threat analysis…
              </div>
            ) : (
              <ThreatCard
                result={result}
                aiExplanation={aiExplain}
                aiLoading={aiLoading}
              />
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
