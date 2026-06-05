// EmptyState — shown when a list, table, or feed has no data
export default function EmptyState({ icon = "ti-inbox", title = "No data", subtitle, action }) {
  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "40px 20px",
      textAlign:      "center",
    }}>
      <i
        className={`ti ${icon}`}
        aria-hidden="true"
        style={{ fontSize: 40, color: "var(--border)", marginBottom: 14 }}
      />
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--border)", maxWidth: 320, lineHeight: 1.7 }}>
          {subtitle}
        </div>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
