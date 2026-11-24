import { useEffect, useState } from 'react';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../services/api';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Message from '../components/Message';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageState from '../components/PageState';
import DoctorForm from '../components/DoctorForm';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(null); // success/error message after an action

  const [editing, setEditing] = useState(null); // null = closed, {} = add, doctor = edit
  const [viewing, setViewing] = useState(null); // doctor shown in detail modal
  const [toDelete, setToDelete] = useState(null); // doctor waiting for delete confirmation
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  // get doctors from the API
  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      setDoctors(await getDoctors(search));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // reload when search changes (wait 300ms after typing stops)
  useEffect(() => {
    const timer = setTimeout(loadDoctors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // create or update, depending on whether the doctor has an id
  const handleSave = async (data) => {
    try {
      setSaving(true);
      setFormError('');
      if (editing.id) {
        await updateDoctor(editing.id, data);
        setNotice({ type: 'success', text: 'Doctor updated successfully' });
      } else {
        await createDoctor(data);
        setNotice({ type: 'success', text: 'Doctor added successfully' });
      }
      setEditing(null);
      loadDoctors();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteDoctor(toDelete.id);
      setNotice({ type: 'success', text: 'Doctor deleted successfully' });
      loadDoctors();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Doctors</h1>
        <Button onClick={() => { setFormError(''); setEditing({}); }}>+ Add Doctor</Button>
      </div>

      {notice && <Message type={notice.type}>{notice.text}</Message>}

      <div className="filters">
        <input
          type="search"
          placeholder="Search by name or specialization"
          aria-label="Search doctors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <PageState
        loading={loading}
        error={error}
        empty={doctors.length === 0}
        emptyTitle="No doctors found"
        emptyText="Add a doctor or change your search."
        onRetry={loadDoctors}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Availability</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone || doctor.email}</td>
                  <td>{doctor.availability}</td>
                  <td>
                    <Badge text={doctor.is_active ? 'Active' : 'Inactive'} type={doctor.is_active ? 'success' : 'danger'} />
                  </td>
                  <td className="actions">
                    <Button size="sm" variant="secondary" onClick={() => setViewing(doctor)}>View</Button>
                    <Button size="sm" variant="secondary" onClick={() => { setFormError(''); setEditing(doctor); }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setToDelete(doctor)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>

      {/* add / edit form */}
      {editing && (
        <Modal title={editing.id ? 'Edit Doctor' : 'Add Doctor'} onClose={() => setEditing(null)}>
          <DoctorForm
            initial={editing}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
            serverError={formError}
          />
        </Modal>
      )}

      {/* detail view */}
      {viewing && (
        <Modal title="Doctor Details" onClose={() => setViewing(null)}>
          <p><strong>Name:</strong> {viewing.name}</p>
          <p><strong>Specialization:</strong> {viewing.specialization}</p>
          <p><strong>Phone:</strong> {viewing.phone || '-'}</p>
          <p><strong>Email:</strong> {viewing.email || '-'}</p>
          <p><strong>Availability:</strong> {viewing.availability}</p>
          <p><strong>Status:</strong> {viewing.is_active ? 'Active' : 'Inactive'}</p>
        </Modal>
      )}

      {/* delete confirmation */}
      {toDelete && (
        <ConfirmDialog
          message={`Are you sure you want to delete ${toDelete.name}?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </>
  );
}