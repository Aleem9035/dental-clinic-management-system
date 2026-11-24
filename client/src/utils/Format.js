// 2026-11-25T05:00:00Z -> "25 Nov 2026, 10:00 am" (local time)
export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// ISO date -> value for <input type="datetime-local"> (local time)
export function toInputDateTime(value) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

// badge colour for each appointment status
export const statusType = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'danger',
};