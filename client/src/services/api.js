const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// one function for all requests: sends request, returns data or throws error
async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || 'Something went wrong');
    error.errors = json.errors; // field errors from backend validation
    throw error;
  }
  return json.data;
}

// doctors
export const getDoctors = (search = '') => request(`/doctors?search=${encodeURIComponent(search)}`);
export const getDoctor = (id) => request(`/doctors/${id}`);
export const createDoctor = (data) => request('/doctors', { method: 'POST', body: JSON.stringify(data) });
export const updateDoctor = (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDoctor = (id) => request(`/doctors/${id}`, { method: 'DELETE' });

// appointments (filters: status, doctorId, date, search)
export const getAppointments = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return request(`/appointments?${params.toString()}`);
};
export const createAppointment = (data) => request('/appointments', { method: 'POST', body: JSON.stringify(data) });
export const updateAppointment = (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAppointment = (id) => request(`/appointments/${id}`, { method: 'DELETE' });

// dashboard
export const getDashboard = () => request('/dashboard');