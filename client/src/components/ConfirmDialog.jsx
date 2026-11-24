import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm delete" onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  );
}