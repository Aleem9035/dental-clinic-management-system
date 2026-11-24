import { useEffect, useState } from 'react';
import { getAppointments, getDoctors, createAppointment, updateAppointment, deleteAppointment } from '../services/api';
import { formatDateTime, statusType } from '../utils/Format';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Message from '../components/Message';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import PageState from '../components/PageState';
import AppointmentForm from '../components/AppointmentForm';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', doctorId: '', date: '' });

  const [editing, setEditing] = useState(null); // null = closed, {} = add, appointment = edit
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  // get appointments using the current filters
  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      setAppointments(await getAppointments(filters));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // doctors are needed for the filter and the form selector
  useEffect(() => {
    getDoctors().then(setDoctors).catch((err) => setError(err.message));
  }, []);

  // reload when any filter changes
  useEffect(() => {
    const timer = setTimeout(loadAppointments, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSave = async (data) => {
    try {
      setSaving(true);
      setFormError('');
      if (editing.id) {
        await updateAppointment(editing.id, data);
        setNotice({ type: 'success', text: 'Appointment updated successfully' });
      } else {
        await createAppointment(data);
        setNotice({ type: 'success', text: 'Appointment added successfully' });
      }
      setEditing(null);
      loadAppointments();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // change only the status from the table (sends the full appointment again)
  const handleStatusChange = async (appointment, status) => {
    try {
      await updateAppointment(appointment.id, { ...appointment, status });
      setNotice({ type: 'success', text: 'Status updated' });
      loadAppointments();
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteAppointment(toDelete.id);
      setNotice({ type: 'success', text: 'Appointment deleted successfully' });
      loadAppointments();
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
        <h1>Appointments</h1>
        <Button onClick={() => { setFormError(''); setEditing({}); }}>+ Add Appointment</Button>
      </div>

      {notice && <Message type={notice.type}>{notice.text}</Message>}

      <div className="filters">
        <input name="search" placeholder="Search patient name" aria-label="Search patient" value={filters.search} onChange={handleFilter} />
        <select name="status" aria-label="Filter by status" value={filters.status} onChange={handleFilter}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select name="doctorId" aria-label="Filter by doctor" value={filters.doctorId} onChange={handleFilter}>
          <option value="">All doctors</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
          ))}
        </select>
        <input name="date" type="date" aria-label="Filter by date" value={filters.date} onChange={handleFilter} />
      </div>

      <PageState
        loading={loading}
        error={error}
        empty={appointments.length === 0}
        emptyTitle="No appointments found"
        emptyText="Add an appointment or change the filters."
        onRetry={loadAppointments}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date and time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient_name}<br /><small>{appointment.patient_phone}</small></td>
                  <td>{appointment.doctor_name}</td>
                  <td>{formatDateTime(appointment.starts_at)}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <Badge text={appointment.status} type={statusType[appointment.status]} />
                    <select
                      aria-label={`Change status for ${appointment.patient_name}`}
                      value={appointment.status}
                      onChange={(e) => handleStatusChange(appointment, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="actions">
                    <Button size="sm" variant="secondary" onClick={() => { setFormError(''); setEditing(appointment); }}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setToDelete(appointment)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageState>

      {editing && (
        <Modal title={editing.id ? 'Edit Appointment' : 'Add Appointment'} onClose={() => setEditing(null)}>
          <AppointmentForm
            initial={editing}
            doctors={doctors}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
            serverError={formError}
          />
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Delete the appointment of ${toDelete.patient_name}?`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </>
  );
}