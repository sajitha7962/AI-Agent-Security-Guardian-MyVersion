import { RiskBadge } from "./Badge";
import ScoreBar from "./ScoreBar";

// ThreatCard — full analysis result displayed after prompt scanning
export default function ThreatCard({ result, aiExplanation, aiLoading }) {
  if (!result) return null;

  return (
    <div style={{ animation: "fadeIn 0.35s ease" }}>
      {/* Score summary row */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16,
      }}>
        {[
          { val: `${result.score}/100`, sub: "Risk Score",    color: result.color },
          { val: result.level,          sub: "Severity",      color: result.color },
          { val: result.threats.length, sub: "Threats Found", color: "var(--accent)" },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "14px 12px", textAlign: "center",
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 22, color: kpi.color, marginBottom: 4 }}>
              {kpi.val}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: 16 }}>
        <ScoreBar
          label="THREAT LEVEL"
          value={result.score}
          color={result.color}
        />
      </div>

      {/* Individual threat list */}
      {result.threats.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "2px", marginBottom: 8, textTransform: "uppercase" }}>
            <i className="ti ti-alert-triangle" aria-hidden="true" style={{ marginRight: 6 }} />
            DETECTED THREATS
          </div>
          {result.threats.map((t, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 5, padding: "9px 12px", marginBottom: 6,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <i className="ti ti-alert-triangle" style={{ color: "var(--accent2)" }} aria-hidden="true" />
                {t.type}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RiskBadge level={t.score >= 40 ? "HIGH" : t.score >= 25 ? "MEDIUM" : "LOW"} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent2)" }}>
                  +{t.score} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI explanation */}
      {(aiLoading || aiExplanation) && (
        <div style={{
          background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.18)",
          borderRadius: 6, padding: 14,
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "2px", marginBottom: 8, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 7 }}>
            <i className="ti ti-brain" aria-hidden="true" />
            AI EXPLANATION
          </div>
          {aiLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>
              <div className="spinner" /> Generating AI explanation…
            </div>
          ) : (
            <p style={{ fontSize: 12, lineHeight: 1.75, color: "var(--text)", whiteSpace: "pre-wrap" }}>
              {aiExplanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
