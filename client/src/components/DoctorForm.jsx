import { useState } from 'react';
import FormField from './Formfield';
import Button from './Button';
import Message from './Message';

// initial = doctor to edit (or nothing for a new doctor)
export default function DoctorForm({ initial, onSubmit, onCancel, saving, serverError }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    specialization: initial?.specialization || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    availability: initial?.availability || '',
    is_active: initial?.is_active ?? true,
  });
  const [errors, setErrors] = useState({});

  // one handler for all inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!form.phone.trim() && !form.email.trim()) newErrors.phone = 'Phone or email is required';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <Message type="error">{serverError}</Message>}

      <FormField label="Name *" name="name" error={errors.name}>
        <input id="name" name="name" value={form.name} onChange={handleChange} />
      </FormField>
      <FormField label="Specialization *" name="specialization" error={errors.specialization}>
        <input id="specialization" name="specialization" value={form.specialization} onChange={handleChange} />
      </FormField>
      <FormField label="Phone" name="phone" error={errors.phone}>
        <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
      </FormField>
      <FormField label="Email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
      </FormField>
      <FormField label="Availability" name="availability">
        <input id="availability" name="availability" placeholder="Mon-Fri 9am-5pm" value={form.availability} onChange={handleChange} />
      </FormField>
      <label>
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} /> Active
      </label>

      <div className="modal-footer">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}