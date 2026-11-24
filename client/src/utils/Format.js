// 2026-11-25T05:00:00Z -> "25 Nov 2026, 10:00 am" (local time)
export function formatDateTime(value) {
  return new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}