// label + any input (children) + error text
export default function FormField({ label, name, error, children }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}