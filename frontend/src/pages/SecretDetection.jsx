import { useState } from "react";
import { Card, CardHeader, CardBody, SectionLabel } from "@/components/ui/Card";
import { RiskBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { sleep } from "@/utils/helpers";

// Secret detection patterns
const SECRET_PATTERNS = [
  { id: "aws_key",     label: "AWS Access Key",       re: /AKIA[0-9A-Z]{16}/g,                color: "#ff4060", severity: "CRITICAL" },
  { id: "aws_secret",  label: "AWS Secret Key",       re: /[A-Za-z0-9/+=]{40}/g,              color: "#ff4060", severity: "CRITICAL" },
  { id: "api_key",     label: "Generic API Key",      re: /api[_-]?key['":\s=]+[A-Za-z0-9_\-]{16,}/gi, color: "#ff4060", severity: "HIGH" },
  { id: "jwt",         label: "JWT Token",            re: /eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]*/g, color: "#ff4060", severity: "CRITICAL" },
  { id: "bearer",      label: "Bearer Token",         re: /bearer\s+[A-Za-z0-9_\-\.]{20,}/gi, color: "#ffb800", severity: "HIGH" },
  { id: "password",    label: "Hardcoded Password",   re: /password['":\s=]+[^\s'"]{8,}/gi,    color: "#ffb800", severity: "HIGH" },
  { id: "db_conn",     label: "Database Connection",  re: /mongodb(\+srv)?:\/\/[^\s]+|postgresql:\/\/[^\s]+|mysql:\/\/[^\s]+/gi, color: "#ff4060", severity: "CRITICAL" },
  { id: "private_key", label: "Private Key Block",    re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g, color: "#ff4060", severity: "CRITICAL" },
  { id: "github_pat",  label: "GitHub PAT",           re: /ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82}/g, color: "#ffb800", severity: "HIGH" },
  { id: "email_addr",  label: "Email Address",        re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, color: "#00d4ff", severity: "MEDIUM" },
  { id: "ip_addr",     label: "IP Address",           re: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,     color: "#00d4ff", severity: "LOW" },
  { id: "secret_kw",   label: "Secret Keyword",       re: /\bsecret['":\s=]+[^\s'"]{8,}/gi,   color: "#ffb800", severity: "HIGH" },
];

const SAMPLES = [
  {
    label: "Config with AWS Keys",
    text: `export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DB_URL=mongodb://admin:password123@prod-db.example.com:27017/customers
SENDGRID_API_KEY=api_key=SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`,
  },
  {
    label: "Leaked JWT",
    text: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiYWRtaW4iOnRydWV9.SIGNATURE
User-Agent: MyApp/1.0
github_pat_11ABCDEFG0123456789012345678901234567890123456789012345678901234`,
  },
  {
    label: "Clean Log Sample",
    text: `[2024-01-15 10:23:44] INFO  Request received: GET /api/health
[2024-01-15 10:23:44] INFO  Response: 200 OK, 12ms
[2024-01-15 10:23:45] INFO  User johndoe@company.com authenticated successfully`,
  },
];

function detectSecrets(text) {
  const findings = [];
  const seen = new Set();
  for (const pat of SECRET_PATTERNS) {
    const re = new RegExp(pat.re.source, pat.re.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      const key = `${pat.id}-${m.index}`;
      if (!seen.has(key)) {
        seen.add(key);
        findings.push({
          ...pat,
          match:   m[0],
          start:   m.index,
          end:     m.index + m[0].length,
          redacted: m[0].slice(0, 4) + "████████████" + m[0].slice(-2),
        });
      }
    }
  }
  return findings.sort((a, b) => a.start - b.start);
}

export default function SecretDetection() {
  const [text,     setText]    = useState("");
  const [loading,  setLoading] = useState(false);
  const [findings, setFindings] = useState(null);

  const scan = async () => {
    setLoading(true);
    setFindings(null);
    await sleep(700);
    setFindings(detectSecrets(text));
    setLoading(false);
  };

  const renderHighlighted = () => {
    if (!findings?.length) return <span style={{ color: "var(--text)" }}>{text}</span>;
    const parts = [];
    let pos = 0;
    for (const f of findings) {
      if (f.start > pos) {
        parts.push(<span key={`t-${pos}`} style={{ color: "var(--text)" }}>{text.slice(pos, f.start)}</span>);
      }
      parts.push(
        <span key={`f-${f.start}`} title={f.label}
          style={{ background: `${f.color}28`, color: f.color, borderBottom: `2px solid ${f.color}`, borderRadius: 2, padding: "0 2px", cursor: "help" }}>
          {f.match.length > 30 ? f.match.slice(0, 12) + "…" + f.match.slice(-4) : f.match}
        </span>
      );
      pos = f.end;
    }
    if (pos < text.length) parts.push(<span key={`t-end`} style={{ color: "var(--text)" }}>{text.slice(pos)}</span>);
    return parts;
  };

  const sevCount = (s) => findings?.filter((f) => f.severity === s).length ?? 0;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <CardHeader title="SECRET DETECTION SCANNER" icon="ti-key" />
        <CardBody>
          <SectionLabel icon="ti-file-text">LOAD SAMPLE</SectionLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {SAMPLES.map((s, i) => (
              <Button key={i} variant="ghost" size="sm" onClick={() => { setText(s.text); setFindings(null); }}>
                {s.label}
              </Button>
            ))}
          </div>

          <SectionLabel icon="ti-scan">PASTE TEXT TO SCAN</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFindings(null); }}
            placeholder="Paste logs, config files, prompts, or any text to scan for secrets and sensitive data…"
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 6, padding: "10px 14px",
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)",
              outline: "none", width: "100%", minHeight: 110, resize: "vertical", marginBottom: 14,
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
          />
          <Button variant="primary" icon="ti-scan" loading={loading} disabled={loading || !text.trim()} onClick={scan}>
            {loading ? "SCANNING…" : "SCAN FOR SECRETS"}
          </Button>
        </CardBody>
      </Card>

      {findings !== null && !loading && (
        <div style={{ animation: "fadeIn 0.35s ease" }}>
          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
            {[
              { val: findings.length,    lbl: "Total Found",   color: findings.length > 0 ? "var(--accent2)" : "var(--accent3)" },
              { val: sevCount("CRITICAL"),lbl: "Critical",     color: "var(--accent2)" },
              { val: sevCount("HIGH"),   lbl: "High",          color: "var(--warn)" },
              { val: sevCount("MEDIUM") + sevCount("LOW"), lbl: "Medium/Low", color: "var(--accent)" },
            ].map((k, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, padding: 14, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 24, color: k.color, marginBottom: 4 }}>{k.val}</div>
                <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{k.lbl}</div>
              </div>
            ))}
          </div>

          {/* Highlighted text */}
          <Card style={{ marginBottom: 14 }}>
            <CardHeader title="HIGHLIGHTED OUTPUT" icon="ti-eye" />
            <CardBody>
              <div style={{
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6,
                padding: "12px 14px", fontFamily: "var(--mono)", fontSize: 11,
                lineHeight: 1.9, whiteSpace: "pre-wrap", wordBreak: "break-all",
              }}>
                {renderHighlighted()}
              </div>
            </CardBody>
          </Card>

          {/* Findings list */}
          {findings.length > 0 ? (
            <Card>
              <CardHeader title="DETECTED SECRETS" icon="ti-alert-triangle" />
              {findings.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
                  borderBottom: "1px solid rgba(26,58,92,0.4)",
                }}>
                  <i className="ti ti-key" style={{ color: f.color, fontSize: 18, flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: f.color }}>{f.redacted}</div>
                  </div>
                  <RiskBadge level={f.severity} />
                </div>
              ))}
            </Card>
          ) : (
            <div style={{ background: "rgba(0,255,157,0.06)", border: "1px solid rgba(0,255,157,0.2)", borderRadius: 8, padding: 20, textAlign: "center" }}>
              <i className="ti ti-shield-check" style={{ fontSize: 30, color: "var(--accent3)" }} aria-hidden="true" />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent3)", marginTop: 8 }}>No secrets detected in this text</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
