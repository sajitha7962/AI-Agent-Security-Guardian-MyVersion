// Card — base surface container used on every page
export function Card({ children, style, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// CardHeader — top strip with title slot + optional right content
export function CardHeader({ title, icon, right, children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 18px", borderBottom: "1px solid var(--border)",
    }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)",
        letterSpacing: "2px", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {icon && <i className={`ti ${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />}
        {title}
        {children}
      </span>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{right}</div>}
    </div>
  );
}

// CardBody — padded content area
export function CardBody({ children, style }) {
  return (
    <div style={{ padding: 18, ...style }}>
      {children}
    </div>
  );
}

// SectionLabel — the small uppercase mono label used above form fields
export function SectionLabel({ icon, children }) {
  return (
    <div style={{
      fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)",
      letterSpacing: "2px", textTransform: "uppercase",
      display: "flex", alignItems: "center", gap: 7,
      marginBottom: 8,
    }}>
      {icon && <i className={`ti ${icon}`} style={{ fontSize: 13 }} aria-hidden="true" />}
      {children}
    </div>
  );
}
