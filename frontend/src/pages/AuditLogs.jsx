import { useState, useMemo } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DecisionBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useGuardianStore } from "@/hooks/useGuardianStore";
import { toCSV, downloadFile, truncate } from "@/utils/helpers";

const COLS = [
  { key: "time",     label: "TIME"     },
  { key: "prompt",   label: "PROMPT"   },
  { key: "action",   label: "ACTION"   },
  { key: "score",    label: "SCORE"    },
  { key: "decision", label: "DECISION" },
  { key: "threat",   label: "THREAT"   },
];

const GRID = "90px 1fr 110px 70px 90px 130px";

export default function AuditLogs() {
  const logs = useGuardianStore((s) => s.logs);

  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("ALL");
  const [page,    setPage]    = useState(1);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((l) => {
      const matchSearch = !q || l.prompt.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.threat.toLowerCase().includes(q);
      const matchFilter = filter === "ALL" || l.decision === filter;
      return matchSearch && matchFilter;
    });
  }, [logs, search, filter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExport = () => {
    const csv = toCSV(filtered, COLS);
    downloadFile(csv, `audit_log_${Date.now()}.csv`, "text/csv");
  };

  const scoreColor = (s) =>
    s >= 60 ? "var(--accent2)" : s >= 30 ? "var(--warn)" : "var(--accent3)";

  return (
    <div>
      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader
          title="AUDIT LOGS"
          icon="ti-clipboard-list"
          right={
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" size="sm" icon="ti-download" onClick={handleExport} disabled={!filtered.length}>
                EXPORT CSV
              </Button>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", alignSelf: "center" }}>
                {filtered.length} entries
              </span>
            </div>
          }
        />
        <CardBody style={{ paddingBottom: 14 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by prompt, action, or threat type…"
              style={{ flex: 1, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", outline: "none" }}
              onFocus={(e)  => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e)   => { e.target.style.borderColor = "var(--border)"; }}
            />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              style={{ width: 120, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text)", outline: "none", cursor: "pointer" }}
            >
              {["ALL", "ALLOW", "WARN", "BLOCK"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </CardBody>

        {/* Table header */}
        <div className="log-row-header" style={{ display: "grid", gridTemplateColumns: GRID }}>
          <span>TIME</span>
          <span>PROMPT</span>
          <span>ACTION</span>
          <span>SCORE</span>
          <span>DECISION</span>
          <span>THREAT TYPE</span>
        </div>

        {/* Empty state */}
        {paginated.length === 0 && (
          <div style={{ padding: "28px 18px", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
            {logs.length === 0
              ? "No audit entries yet — run analyses in the Firewall or Simulator pages to populate."
              : "No results match your filter."}
          </div>
        )}

        {/* Rows */}
        {paginated.map((l) => (
          <div
            key={l.id}
            className="log-row"
            style={{ display: "grid", gridTemplateColumns: GRID }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{l.time}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={l.prompt}>
              {truncate(l.prompt, 55)}
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>{l.action}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: scoreColor(l.score) }}>
              {Math.round(l.score)}/100
            </span>
            <DecisionBadge decision={l.decision} style={{ fontSize: 9, padding: "1px 6px" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{truncate(l.threat, 20)}</span>
          </div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", justifyContent: "flex-end" }}>
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← PREV</Button>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
              {page} / {totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>NEXT →</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
