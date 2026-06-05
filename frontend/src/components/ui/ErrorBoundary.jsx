import { Component } from "react";

/**
 * ErrorBoundary — catches render errors in any child tree.
 * Wrap page components with this to prevent a single bad page
 * from crashing the entire app.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: 48, textAlign: "center",
      }}>
        <i className="ti ti-alert-triangle" aria-hidden="true"
          style={{ fontSize: 44, color: "var(--accent2)", marginBottom: 16 }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
          Something went wrong
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", maxWidth: 420, marginBottom: 20, lineHeight: 1.8 }}>
          {this.state.error?.message ?? "An unexpected error occurred."}
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 6, padding: "8px 16px", color: "var(--muted)",
            fontFamily: "var(--sans)", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
