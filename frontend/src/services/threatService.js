/**
 * threatService.js
 *
 * Higher-level service that orchestrates:
 *   1. Instant local risk scoring (riskEngine) for immediate UI feedback
 *   2. Backend analysis call for persistence + AI explanation
 *   3. Store updates (stats, audit log, notification)
 */
import { calculateRisk } from "@/utils/riskEngine";
import { firewallAPI } from "./api";

/**
 * analyzePrompt(prompt, store)
 *
 * @param {string}  prompt  — raw prompt text
 * @param {object}  store   — { addStats, addLog, setNotification } from useGuardianStore
 * @returns {{ local: RiskResult, remote: Promise<object> }}
 */
export function analyzePrompt(prompt, store) {
  // ── 1. Instant local result ──────────────────────────────────────────────
  const local = calculateRisk(prompt);

  // ── 2. Update store immediately ──────────────────────────────────────────
  store.addStats(local);
  store.addLog({
    time:     new Date().toLocaleTimeString(),
    prompt:   prompt.slice(0, 80),
    action:   "Prompt Analysis",
    score:    local.score,
    decision: local.score >= 50 ? "BLOCK" : local.score >= 25 ? "WARN" : "ALLOW",
    threat:   local.threats[0]?.type ?? "None",
  });

  if (local.score >= 50) {
    store.setNotification({
      type: "threat",
      msg:  `${local.level} threat: ${local.threats[0]?.type ?? "Unknown"} (${local.score}/100)`,
    });
  }

  // ── 3. Remote call (returns a Promise the caller can await) ──────────────
  const remote = firewallAPI.analyze(prompt).catch(() => null);

  return { local, remote };
}

/**
 * severityLabel(score)
 * Returns a human-readable severity string for any numeric score.
 */
export function severityLabel(score) {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

/**
 * decisionFromScore(score, actionRisk, policyBlocked)
 */
export function decisionFromScore(score, actionRisk = 0, policyBlocked = false) {
  if (policyBlocked || score >= 60 || actionRisk >= 80) return "BLOCK";
  if (score >= 30  || actionRisk >= 50)                  return "WARN";
  return "ALLOW";
}

/**
 * buildAuditEntry(fields) — consistent audit log shape
 */
export function buildAuditEntry({ prompt, action, score, decision, threat, agentId }) {
  return {
    time:     new Date().toLocaleTimeString(),
    prompt:   (prompt ?? "").slice(0, 100),
    action:   action  ?? "Unknown",
    score:    Math.round(score ?? 0),
    decision: decision ?? "ALLOW",
    threat:   threat  ?? "None",
    agentId:  agentId ?? null,
    id:       Date.now(),
  };
}
