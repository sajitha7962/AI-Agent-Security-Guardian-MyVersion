// ---------------------------------------------------------------------------
// riskEngine.js — deterministic rule-based threat scoring
// Mirrors the backend risk_engine.py so the UI can give instant feedback
// before the API round-trip completes.
// ---------------------------------------------------------------------------

export const THREAT_RULES = [
  {
    id:      "prompt_injection",
    type:    "Prompt Injection",
    score:   40,
    pattern: /ignore\s+(all\s+)?(previous|prior)\s+(instructions?|prompt|rules|context)|forget\s+(everything|all)\s+previously/i,
  },
  {
    id:      "jailbreak",
    type:    "Jailbreak",
    score:   50,
    pattern: /jailbreak|do\s+anything\s+now|\bdan\b|no\s+restrictions|unrestricted\s+mode|pretend\s+you\s+(have\s+no|are\s+without|don't\s+have)/i,
  },
  {
    id:      "role_override",
    type:    "Role Override",
    score:   25,
    pattern: /you\s+are\s+now|act\s+as\s+(an?\s+)?ai|new\s+persona|your\s+new\s+role|roleplay\s+as|from\s+now\s+on\s+you|you\s+must\s+now\s+act/i,
  },
  {
    id:      "data_exfiltration",
    type:    "Data Exfiltration",
    score:   35,
    pattern: /exfiltrate|send\s+.{0,30}\s+to|forward\s+.{0,30}\s+to|export\s+.{0,20}(customer|user|database|table)|upload\s+.{0,20}\s+to/i,
  },
  {
    id:      "system_prompt_leak",
    type:    "System Prompt Leak",
    score:   35,
    pattern: /reveal\s+(your\s+)?(system\s+)?prompt|print\s+(your\s+)?(full\s+)?instructions|show\s+me\s+your\s+config|what\s+are\s+your\s+instructions|display\s+your\s+system\s+prompt/i,
  },
  {
    id:      "secret_detection",
    type:    "Secret Detection",
    score:   35,
    pattern: /api[_\s-]?key|access[_\s-]?token|bearer\s+token|aws[_\s-]?secret|private[_\s-]?key|database[_\s-]?password|jwt[_\s-]?secret|\.env\b/i,
  },
  {
    id:      "privilege_escalation",
    type:    "Privilege Escalation",
    score:   40,
    pattern: /escalate\s+(to\s+)?admin|elevate\s+privileges?|grant\s+(me\s+)?root|sudo\s+access|bypass\s+(the\s+)?auth|override\s+permissions?/i,
  },
  {
    id:      "destructive_action",
    type:    "Destructive Action",
    score:   25,
    pattern: /drop\s+table|rm\s+-rf|delete\s+all|truncate\s+database|wipe\s+the|destroy\s+all\s+records/i,
  },
  {
    id:      "tool_abuse",
    type:    "Tool Abuse",
    score:   20,
    pattern: /call\s+the\s+tool|invoke\s+function|execute\s+command|run\s+shell|tool_call\s*\(/i,
  },
  {
    id:      "rag_poisoning",
    type:    "RAG Poisoning",
    score:   35,
    pattern: /\[system:/i.test("x") ? /\[system:/i : /\[system:|<system>|<\|system\|>|\{\s*"system"\s*:/i,
  },
];

/**
 * calculateRisk(text)
 * Returns { score, level, color, threats }
 *   score  — 0–100 capped
 *   level  — "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
 *   color  — CSS variable string
 *   threats — array of { type, score, id }
 */
export function calculateRisk(text = "") {
  const threats = [];
  let total = 0;

  for (const rule of THREAT_RULES) {
    if (rule.pattern.test(text)) {
      threats.push({ type: rule.type, score: rule.score, id: rule.id });
      total += rule.score;
    }
  }

  const score = Math.min(total, 100);
  const level =
    score >= 75 ? "CRITICAL" :
    score >= 50 ? "HIGH"     :
    score >= 25 ? "MEDIUM"   : "LOW";

  const color =
    score >= 75 ? "var(--accent2)" :
    score >= 50 ? "var(--warn)"    :
    score >= 25 ? "var(--accent)"  : "var(--accent3)";

  return { score, level, color, threats };
}

/**
 * getRiskBadgeClass(level)
 * Returns the CSS class for the risk badge.
 */
export function getRiskBadgeClass(level = "") {
  return `rb-${level.toLowerCase()}`;
}

/**
 * getDecisionBadgeClass(decision)
 */
export function getDecisionBadgeClass(decision = "") {
  return `dec-${decision.toLowerCase()}`;
}

/**
 * scoreToDecision(score, actionRisk, policyBlocked)
 * Maps a combined risk score to ALLOW | WARN | BLOCK
 */
export function scoreToDecision(score, actionRisk = 0, policyBlocked = false) {
  if (policyBlocked || score >= 60 || actionRisk >= 80) return "BLOCK";
  if (score >= 30 || actionRisk >= 50) return "WARN";
  return "ALLOW";
}
