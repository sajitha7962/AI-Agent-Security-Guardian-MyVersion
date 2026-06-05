import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const SYSTEM_PROMPT = `You are an expert AI Security Copilot for an enterprise platform called "AI Agent Security Guardian". You help security engineers understand:
- AI agent threat vectors (prompt injection, jailbreak, data exfiltration, RAG poisoning, tool abuse, privilege escalation)
- Security policy design and configuration
- Risk scoring methodology
- Incident response for AI security events
- OWASP LLM Top 10 compliance
- MCP tool security and governance

Be concise, technical, and actionable. Format lists with bullet points. Keep responses under 250 words unless the question requires depth.`;

const QUICK_QUESTIONS = [
  "Why are prompt injections dangerous?",
  "How do I prevent jailbreak attacks?",
  "What is RAG poisoning?",
  "Explain the OWASP LLM Top 10",
  "How does risk scoring work?",
  "What is MCP tool abuse?",
];

async function callCopilot(messages) {
  // Try backend first
  try {
    const res = await fetch("/api/copilot/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (res.ok) {
      const d = await res.json();
      return d.response;
    }
  } catch { /* fall through */ }

  // Fallback: direct Anthropic call
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
    }),
  });
  const data = await res.json();
  return data.content?.map((b) => b.text || "").join("") || "AI service unavailable.";
}

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I'm the Security Guardian AI Copilot. I can explain threat detections, help design security policies, and advise on AI agent security best practices. What would you like to know?",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg  = { role: "user", content: msg };
    const history  = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const reply = await callCopilot(history);
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", content: "I'm having trouble connecting. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <Card style={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title="AI SECURITY COPILOT"
        icon="ti-robot"
        right={
          <div className="status-pill">
            <div className="status-dot" />
            CLAUDE-POWERED
          </div>
        }
      />

      {/* Chat messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-msg ${m.role === "user" ? "chat-user" : "chat-ai"}`}
            style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}
          >
            {m.role === "ai" && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--accent)", letterSpacing: "1.5px", marginBottom: 5 }}>
                SECURITY GUARDIAN AI
              </div>
            )}
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg chat-ai" style={{ alignSelf: "flex-start" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--accent)", letterSpacing: "1.5px", marginBottom: 5 }}>
              SECURITY GUARDIAN AI
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
              <div className="spinner" style={{ width: 14, height: 14 }} /> Analyzing…
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick questions */}
      <div style={{ padding: "8px 14px", borderTop: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => send(q)}
            disabled={loading}
            style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 4, padding: "3px 9px", cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)",
              transition: "all 0.15s", letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask about any security threat, policy, or AI agent vulnerability…"
          disabled={loading}
          style={{
            flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "9px 12px", fontFamily: "var(--mono)",
            fontSize: 11, color: "var(--text)", outline: "none",
          }}
          onFocus={(e)  => { e.target.style.borderColor = "var(--accent)"; }}
          onBlur={(e)   => { e.target.style.borderColor = "var(--border)"; }}
        />
        <Button variant="primary" icon="ti-send" loading={loading} disabled={loading || !input.trim()} onClick={() => send()}>
          SEND
        </Button>
      </div>
    </Card>
  );
}
