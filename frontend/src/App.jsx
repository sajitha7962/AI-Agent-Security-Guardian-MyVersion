import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard        from "@/pages/Dashboard";
import PromptFirewall   from "@/pages/PromptFirewall";
import ActionMonitor    from "@/pages/ActionMonitor";
import ExecutionTimeline from "@/pages/ExecutionTimeline";
import AttackSimulator  from "@/pages/AttackSimulator";
import PolicyEngine     from "@/pages/PolicyEngine";
import AuditLogs        from "@/pages/AuditLogs";
import AICopilot        from "@/pages/AICopilot";
import MultiAgent       from "@/pages/MultiAgent";
import MCPSecurity      from "@/pages/MCPSecurity";
import RAGSecurity      from "@/pages/RAGSecurity";
import SOCView          from "@/pages/SOCView";
import ExecutiveDashboard from "@/pages/ExecutiveDashboard";
import TrustEngine      from "@/pages/TrustEngine";
import SecretDetection  from "@/pages/SecretDetection";
import DemoMode         from "@/pages/DemoMode";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="firewall"       element={<PromptFirewall />} />
        <Route path="actions"        element={<ActionMonitor />} />
        <Route path="timeline"       element={<ExecutionTimeline />} />
        <Route path="simulator"      element={<AttackSimulator />} />
        <Route path="policies"       element={<PolicyEngine />} />
        <Route path="audit"          element={<AuditLogs />} />
        <Route path="copilot"        element={<AICopilot />} />
        <Route path="multiagent"     element={<MultiAgent />} />
        <Route path="mcp"            element={<MCPSecurity />} />
        <Route path="rag"            element={<RAGSecurity />} />
        <Route path="soc"            element={<SOCView />} />
        <Route path="executive"      element={<ExecutiveDashboard />} />
        <Route path="trust"          element={<TrustEngine />} />
        <Route path="secrets"        element={<SecretDetection />} />
        <Route path="demo"           element={<DemoMode />} />
        <Route path="*"              element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
