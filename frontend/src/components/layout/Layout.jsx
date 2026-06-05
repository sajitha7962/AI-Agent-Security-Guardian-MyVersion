import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Notification from "../ui/Notification";
import { useGuardianStore } from "@/hooks/useGuardianStore";

// Map route → [title, subtitle]
const PAGE_META = {
  "/dashboard":  ["SECURITY DASHBOARD",    "REAL-TIME THREAT MONITORING"],
  "/firewall":   ["PROMPT FIREWALL",        "AI THREAT DETECTION ENGINE"],
  "/actions":    ["ACTION MONITOR",         "AGENT BEHAVIOUR ANALYSIS"],
  "/timeline":   ["EXECUTION TIMELINE",     "AGENT PIPELINE VISUALISER"],
  "/simulator":  ["ATTACK SIMULATOR",       "RED TEAM TESTING MODULE"],
  "/policies":   ["POLICY ENGINE",          "SECURITY RULE MANAGEMENT"],
  "/audit":      ["AUDIT LOGS",             "FORENSIC TRAIL"],
  "/copilot":    ["AI COPILOT",             "SECURITY INTELLIGENCE ASSISTANT"],
  "/multiagent": ["MULTI-AGENT SECURITY",   "AGENT NETWORK MONITOR"],
  "/mcp":        ["MCP TOOL SECURITY",      "TOOL CALL ANALYSIS"],
  "/rag":        ["RAG SECURITY",           "RETRIEVAL AUGMENTATION GUARD"],
  "/soc":        ["SOC ANALYST VIEW",       "SECURITY OPERATIONS CENTER"],
  "/executive":  ["EXECUTIVE DASHBOARD",    "BUSINESS INTELLIGENCE"],
  "/trust":      ["TRUST ENGINE",           "AGENT TRUST SCORING"],
  "/secrets":    ["SECRET DETECTION",       "SENSITIVE DATA SCANNER"],
  "/demo":       ["DEMO MODE",              "HACKATHON SHOWCASE"],
};

export default function Layout() {
  const { pathname } = useLocation();
  const notification  = useGuardianStore((s) => s.notification);
  const clearNotif    = useGuardianStore((s) => s.clearNotification);

  const [title, subtitle] = PAGE_META[pathname] ?? ["GUARDIAN", "AI SECURITY PLATFORM"];

  return (
    <>
      {/* Animated grid background */}
      <div className="grid-bg" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />

      <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 2 }}>
        <Sidebar />

        <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Topbar title={title} subtitle={subtitle} />

          <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global toast notification */}
      {notification && (
        <Notification notif={notification} onClose={clearNotif} />
      )}
    </>
  );
}
