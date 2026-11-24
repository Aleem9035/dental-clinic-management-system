import EmptyState from './EmptyState';
import Message from './Message';
import Button from './Button';

export default function PageState({ loading, error, empty, emptyTitle, emptyText, onRetry, children }) {
  if (loading) return <div className="state-box" role="status">Loading...</div>;
  if (error) {
    return (
      <div className="state-box">
        <Message type="error">{error}</Message>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    );
  }
  if (empty) return <EmptyState title={emptyTitle} text={emptyText} />;
  return children;
}