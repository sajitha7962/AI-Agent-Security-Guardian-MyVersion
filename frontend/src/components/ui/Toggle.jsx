// Toggle — the on/off pill used in Policy Engine and settings
export default function Toggle({ value, onChange, disabled = false }) {
  return (
    <div
      role="switch"
      aria-checked={value}
      className={`toggle ${value ? "on" : ""}`}
      onClick={() => !disabled && onChange(!value)}
      style={{ opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <div className="toggle-knob" />
    </div>
  );
}
