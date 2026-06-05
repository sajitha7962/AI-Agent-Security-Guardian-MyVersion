import { create } from "zustand";

// ---------------------------------------------------------------------------
// useGuardianStore — central state shared across every page
// ---------------------------------------------------------------------------
export const useGuardianStore = create((set, get) => ({
  // ── Session-level stats (incremented as user runs analyses) ──
  stats: {
    total:      0,
    threats:    0,
    safe:       0,
    injections: 0,
    jailbreaks: 0,
    exfil:      0,
    toolAbuse:  0,
    warned:     0,
  },

  // ── In-memory audit log (last 200 entries) ──
  logs: [],

  // ── Active notification ──
  notification: null,

  // ── Currently active page title (set by Layout) ──
  pageTitle: "SECURITY DASHBOARD",

  // ── System trust score (100 − violations * 3, min 20) ──
  systemTrust: 100,

  // ── Actions ──

  addStats(risk) {
    const threats = risk.threats ?? [];
    const isBlocked = risk.score >= 50;
    set((s) => ({
      stats: {
        total:      s.stats.total + 1,
        threats:    s.stats.threats    + (isBlocked ? 1 : 0),
        safe:       s.stats.safe       + (risk.score < 25 ? 1 : 0),
        warned:     s.stats.warned     + (!isBlocked && risk.score >= 25 ? 1 : 0),
        injections: s.stats.injections + (threats.some((t) => t.type === "Prompt Injection") ? 1 : 0),
        jailbreaks: s.stats.jailbreaks + (threats.some((t) => t.type === "Jailbreak") ? 1 : 0),
        exfil:      s.stats.exfil      + (threats.some((t) => t.type === "Data Exfiltration") ? 1 : 0),
        toolAbuse:  s.stats.toolAbuse  + (threats.some((t) => t.type === "Tool Abuse") ? 1 : 0),
      },
      systemTrust: Math.max(20, s.systemTrust - (isBlocked ? 3 : 0)),
    }));
  },

  addLog(entry) {
    set((s) => ({
      logs: [{ ...entry, id: Date.now() }, ...s.logs].slice(0, 200),
    }));
  },

  setNotification(notif) {
    set({ notification: notif });
    // Auto-clear after 4 s
    setTimeout(() => set({ notification: null }), 4200);
  },

  clearNotification() {
    set({ notification: null });
  },

  resetStats() {
    set({
      stats: { total: 0, threats: 0, safe: 0, injections: 0, jailbreaks: 0, exfil: 0, toolAbuse: 0, warned: 0 },
      logs: [],
      systemTrust: 100,
    });
  },
}));
