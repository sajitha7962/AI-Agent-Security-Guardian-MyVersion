// LoadingRow — inline spinner with text, used during API calls
export default function LoadingRow({ message = "Analyzing…", style }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "18px 20px", fontFamily: "var(--mono)",
      fontSize: 11, color: "var(--accent)",
      ...style,
    }}>
      <div className="spinner" />
      {message}
    </div>
  );
}
