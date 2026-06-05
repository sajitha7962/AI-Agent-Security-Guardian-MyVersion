import { useState } from "react";
import { Card, CardHeader, CardBody, SectionLabel } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { DEFAULT_POLICIES } from "@/utils/constants";
import { uid } from "@/utils/helpers";

export default function PolicyEngine() {
  const [policies,   setPolicies]   = useState(DEFAULT_POLICIES);
  const [newPolicy,  setNewPolicy]  = useState({ label: "", desc: "", category: "BLOCK" });
  const [addingNew,  setAddingNew]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);

  const toggle  = (id) => setPolicies((ps) => ps.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
  const remove  = (id) => setPolicies((ps) => ps.filter((p) => p.id !== id));

  const addPolicy = () => {
    if (!newPolicy.label.trim()) return;
    setPolicies((ps) => [...ps, { ...newPolicy, id: `custom_${uid()}`, enabled: true }]);
    setNewPolicy({ label: "", desc: "", category: "BLOCK" });
    setAddingNew(false);
  };

  const blockPolicies = policies.filter((p) => p.category === "BLOCK");
  const warnPolicies  = policies.filter((p) => p.category === "WARN");
  const activeCount   = policies.filter((p) => p.enabled).length;

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { num: policies.length,                     label: "Total Policies",   color: "var(--accent)"  },
          { num: activeCount,                         label: "Active Policies",  color: "var(--accent3)" },
          { num: policies.length - activeCount,       label: "Disabled",         color: "var(--muted)"   },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 28, color: s.color }}>{s.num}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* BLOCK policies */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader
          title="BLOCK POLICIES"
          icon="ti-shield-x"
          right={<span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{blockPolicies.filter((p) => p.enabled).length}/{blockPolicies.length} ACTIVE</span>}
        />
        {blockPolicies.map((p) => (
          <PolicyRow key={p.id} policy={p} onToggle={toggle} onRemove={remove} />
        ))}
      </Card>

      {/* WARN policies */}
      <Card style={{ marginBottom: 14 }}>
        <CardHeader
          title="WARN POLICIES"
          icon="ti-alert-triangle"
          right={<span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{warnPolicies.filter((p) => p.enabled).length}/{warnPolicies.length} ACTIVE</span>}
        />
        {warnPolicies.map((p) => (
          <PolicyRow key={p.id} policy={p} onToggle={toggle} onRemove={remove} />
        ))}
      </Card>

      {/* Add new policy */}
      <Card>
        <CardHeader
          title="ADD NEW POLICY"
          icon="ti-plus"
          right={
            <Button variant="ghost" size="sm" onClick={() => setAddingNew((v) => !v)}>
              {addingNew ? "CANCEL" : "+ NEW"}
            </Button>
          }
        />
        {addingNew && (
          <CardBody>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <SectionLabel>POLICY NAME</SectionLabel>
                <input
                  className="inp"
                  value={newPolicy.label}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Block credential access"
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", outline: "none", width: "100%" }}
                />
              </div>
              <div>
                <SectionLabel>CATEGORY</SectionLabel>
                <select
                  value={newPolicy.category}
                  onChange={(e) => setNewPolicy((p) => ({ ...p, category: e.target.value }))}
                  style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", outline: "none", width: "100%", cursor: "pointer" }}
                >
                  <option value="BLOCK">BLOCK</option>
                  <option value="WARN">WARN</option>
                </select>
              </div>
            </div>
            <SectionLabel>DESCRIPTION</SectionLabel>
            <input
              value={newPolicy.desc}
              onChange={(e) => setNewPolicy((p) => ({ ...p, desc: e.target.value }))}
              placeholder="Describe what this policy prevents…"
              style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "9px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", outline: "none", width: "100%", marginBottom: 14 }}
            />
            <Button variant="primary" icon="ti-check" onClick={addPolicy} disabled={!newPolicy.label.trim()}>
              SAVE POLICY
            </Button>
          </CardBody>
        )}
      </Card>
    </div>
  );
}

function PolicyRow({ policy, onToggle, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 18px", borderBottom: "1px solid rgba(26,58,92,0.4)",
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: policy.enabled ? "#fff" : "var(--muted)" }}>
            {policy.label}
          </span>
          <CategoryBadge category={policy.category} />
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
          {policy.desc}
        </div>
      </div>
      <button
        onClick={() => onRemove(policy.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4, fontSize: 16, marginRight: 4, transition: "color 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
        aria-label="Remove policy"
      >
        <i className="ti ti-trash" aria-hidden="true" />
      </button>
      <Toggle value={policy.enabled} onChange={() => onToggle(policy.id)} />
    </div>
  );
}
