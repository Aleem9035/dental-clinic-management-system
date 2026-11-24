import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ title, onClose, children }) {
  // close when Escape key is pressed
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <Button variant="secondary" size="sm" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        {children}
      </div>
    </div>
  );
}