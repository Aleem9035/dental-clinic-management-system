// type: error | success
export default function Message({ type, children }) {
  return (
    <div className={`message message-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}