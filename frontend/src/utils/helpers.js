// ---------------------------------------------------------------------------
// helpers.js — formatting and utility functions
// ---------------------------------------------------------------------------

/** Format an ISO timestamp to HH:MM:SS */
export function formatTime(isoStr) {
  try {
    return new Date(isoStr).toLocaleTimeString("en-US", { hour12: false });
  } catch {
    return isoStr;
  }
}

/** Truncate a string to maxLen chars */
export function truncate(str = "", maxLen = 60) {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/** Convert a risk score (0-100) to a level label */
export function scoreToLevel(score) {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

/** Convert a trust score to a label */
export function trustLabel(score) {
  if (score >= 80) return "TRUSTED";
  if (score >= 60) return "MODERATE";
  if (score >= 40) return "CAUTION";
  return "UNTRUSTED";
}

/** Get CSS color variable from a trust score */
export function trustColor(score) {
  if (score >= 80) return "var(--accent3)";
  if (score >= 60) return "var(--accent)";
  if (score >= 40) return "var(--warn)";
  return "var(--accent2)";
}

/** Download any string as a file */
export function downloadFile(content, filename, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Convert an array of objects to CSV string */
export function toCSV(rows, columns) {
  const header = columns.map((c) => c.label).join(",");
  const body   = rows.map((r) =>
    columns.map((c) => {
      const val = r[c.key] ?? "";
      return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
    }).join(",")
  ).join("\n");
  return `${header}\n${body}`;
}

/** Sleep helper */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Clamp a number between min and max */
export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** Generate a short random ID */
export const uid = () => Math.random().toString(36).slice(2, 9);
