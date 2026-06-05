import { useState } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { TrustMeter } from "@/components/ui/ScoreBar";
import { AGENTS, STATUS_COLOR } from "@/utils/constants";
import { trustColor } from "@/utils/helpers";

function AgentIcon({ trust }) {
  const bg  = `${trustColor(trust)}18`;
  const bdr = `${trustColor(trust)}33`;
  return (
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: bg, border: `1px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
      <i className="ti ti-robot" style={{ color: trustColor(trust), fontSize: 22 }} aria-hidden="true" />
    </div>
  );
}

export default function MultiAgent() {
  const [selected, setSelected] = useState(null);
  const sel = selected ? AGENTS.find((a) => a.id === selected) : null;

  const commLinks = [
    { from: "a1", to: "a2", safe: true,  label: "→ data handoff" },
    { from: "a2", to: "a3", safe: false, label: "→ UNSAFE delegation" },
    { from: "a4", to: "a1", safe: true,  label: "→ lookup request" },
    { from: "a3", to: "a4", safe: false, label: "→ privilege probe" },
  ];

  return (
    <div>
      {/* Agent grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 16 }}>
        {AGENTS.map((a) => (
          <div
            key={a.id}
            className={`agent-node ${selected === a.id ? "selected" : ""} ${a.violations >= 8 ? "threat" : ""}`}
            onClick={() => setSelected(selected === a.id ? null : a.id)}
          >
            <AgentIcon trust={a.trust} />
            <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>{a.name}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", letterSpacing: "1px", marginBottom: 10 }}>
              {a.role.toUpperCase()}
            </div>
            <TrustMeter score={a.trust} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", marginBottom: 2 }}>VIOLATIONS</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: a.violations >= 8 ? "var(--accent2)" : a.violations >= 5 ? "var(--warn)" : "var(--accent3)" }}>
                  {a.violations}
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Selected agent detail */}
      {sel && (
        <Card style={{ marginBottom: 16, animation: "fadeIn 0.3s ease" }}>
          <CardHeader title={sel.name.toUpperCase()} icon="ti-robot" right={<TrustMeter score={sel.trust} />} />
          <CardBody>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { val: sel.trust,      lbl: "Trust Score",  color: trustColor(sel.trust) },
                { val: sel.violations, lbl: "Violations",   color: sel.violations >= 8 ? "var(--accent2)" : "var(--warn)" },
                { val: sel.status.toUpperCase(), lbl: "Status", color: STATUS_COLOR[sel.status] },
              ].map((k, i) => (
                <div key={i} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: 14, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 20, color: k.color, marginBottom: 4 }}>{k.val}</div>
                  <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>{k.lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
              RECENT EVENTS
            </div>
            {[
              "Accessed external knowledge base — ALLOWED",
              "Attempted to read system credentials — BLOCKED",
              "Sent routine status report — ALLOWED",
            ].map((ev, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(26,58,92,0.3)", fontSize: 11, color: "var(--muted)" }}>
                <i className={`ti ${i === 1 ? "ti-shield-x" : "ti-shield-check"}`} style={{ color: i === 1 ? "var(--accent2)" : "var(--accent3)", flexShrink: 0 }} aria-hidden="true" />
                {ev}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Communication graph */}
      <Card>
        <CardHeader title="AGENT COMMUNICATION ANALYSIS" icon="ti-network" />
        <CardBody>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
            INTER-AGENT LINK SECURITY
          </div>
          {commLinks.map((l, i) => {
            const fromAgent = AGENTS.find((a) => a.id === l.from);
            const toAgent   = AGENTS.find((a) => a.id === l.to);
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 6, marginBottom: 6,
                background: l.safe ? "rgba(0,255,157,0.04)" : "rgba(255,64,96,0.06)",
                border: `1px solid ${l.safe ? "rgba(0,255,157,0.15)" : "rgba(255,64,96,0.2)"}`,
              }}>
                <i className={`ti ${l.safe ? "ti-check" : "ti-alert-triangle"}`}
                  style={{ color: l.safe ? "var(--accent3)" : "var(--accent2)", fontSize: 16, flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1, fontSize: 12 }}>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{fromAgent?.name}</span>
                  <span style={{ color: "var(--muted)", margin: "0 6px" }}>{l.label}</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>{toAgent?.name}</span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: l.safe ? "var(--accent3)" : "var(--accent2)" }}>
                  {l.safe ? "SAFE" : "UNSAFE"}
                </span>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
