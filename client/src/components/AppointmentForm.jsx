import { useState } from 'react';
import FormField from './Formfield';
import Button from './Button';
import Message from './Message';
import { toInputDateTime } from '../utils/Format';

// doctors = list for the doctor selector, initial = appointment to edit
export default function AppointmentForm({ initial, doctors, onSubmit, onCancel, saving, serverError }) {
  const [form, setForm] = useState({
    patient_name: initial?.patient_name || '',
    patient_phone: initial?.patient_phone || '',
    patient_email: initial?.patient_email || '',
    doctor_id: initial?.doctor_id || '',
    starts_at: initial?.starts_at ? toInputDateTime(initial.starts_at) : '',
    duration_minutes: initial?.duration_minutes || 30,
    reason: initial?.reason || '',
    status: initial?.status || 'pending',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.patient_name.trim()) newErrors.patient_name = 'Patient name is required';
    if (!form.patient_phone.trim()) newErrors.patient_phone = 'Patient phone is required';
    if (!form.doctor_id) newErrors.doctor_id = 'Please select a doctor';
    if (!form.starts_at) newErrors.starts_at = 'Date and time are required';
    if (!form.reason.trim()) newErrors.reason = 'Reason is required';
    if (Number(form.duration_minutes) <= 0) newErrors.duration_minutes = 'Duration must be more than 0';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // send the time as full ISO (UTC) so the server and browser agree on the time
    onSubmit({
      ...form,
      doctor_id: Number(form.doctor_id),
      duration_minutes: Number(form.duration_minutes),
      starts_at: new Date(form.starts_at).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <Message type="error">{serverError}</Message>}

      <Formfield label="Patient name *" name="patient_name" error={errors.patient_name}>
        <input id="patient_name" name="patient_name" value={form.patient_name} onChange={handleChange} />
      </Formfield>
      <Formfield label="Patient phone *" name="patient_phone" error={errors.patient_phone}>
        <input id="patient_phone" name="patient_phone" value={form.patient_phone} onChange={handleChange} />
      </Formfield>
      <Formfield label="Patient email" name="patient_email">
        <input id="patient_email" name="patient_email" type="email" value={form.patient_email} onChange={handleChange} />
      </Formfield>
      <Formfield label="Doctor *" name="doctor_id" error={errors.doctor_id}>
        <select id="doctor_id" name="doctor_id" value={form.doctor_id} onChange={handleChange}>
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} ({doctor.specialization})
            </option>
          ))}
        </select>
      </Formfield>
      <Formfield label="Date and time *" name="starts_at" error={errors.starts_at}>
        <input id="starts_at" name="starts_at" type="datetime-local" value={form.starts_at} onChange={handleChange} />
      </Formfield>
      <Formfield label="Duration (minutes)" name="duration_minutes" error={errors.duration_minutes}>
        <input id="duration_minutes" name="duration_minutes" type="number" min="5" step="5" value={form.duration_minutes} onChange={handleChange} />
      </Formfield>
      <Formfield label="Reason *" name="reason" error={errors.reason}>
        <textarea id="reason" name="reason" rows="2" value={form.reason} onChange={handleChange} />
      </Formfield>
      <Formfield label="Status" name="status">
        <select id="status" name="status" value={form.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Formfield>

      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}