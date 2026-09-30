const pad = (n) => String(n).padStart(2, '0');

/** Parse "YYYY-MM-DD" into a local Date, or null when invalid. */
export const parseISO = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (y < 1900 || y > 2200) return null;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
};
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const startOfToday = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
/** Whole days from a to b (DST-safe). */
export const diffDays = (a, b) => Math.round((b - a) / 86400000);

const LONG_MONTH = { month: 'long' };
const fmt = (d, opts) => d.toLocaleDateString('en-US', opts);

export const formatLong = (iso) => {
  const d = parseISO(iso);
  return d ? fmt(d, { month: 'long', day: 'numeric', year: 'numeric' }) : '';
};
export const formatShort = (iso) => {
  const d = parseISO(iso);
  return d ? fmt(d, { month: 'short', day: 'numeric' }) : '';
};
export const formatWeekday = (d) => fmt(d, { weekday: 'long', month: 'long', day: 'numeric' });

/** "June 12–18, 2027" / "Oct 30 – Nov 2, 2026" / "Dec 28, 2026 – Jan 3, 2027" */
export const formatRange = (startISO, endISO) => {
  const s = parseISO(startISO);
  const e = parseISO(endISO);
  if (!s || !e) return '';
  if (s.getTime() === e.getTime()) return fmt(s, { month: 'long', day: 'numeric', year: 'numeric' });
  if (s.getFullYear() === e.getFullYear()) {
    if (s.getMonth() === e.getMonth()) {
      return `${fmt(s, LONG_MONTH)} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
    }
    return `${fmt(s, { month: 'short', day: 'numeric' })} – ${fmt(e, { month: 'short', day: 'numeric' })}, ${e.getFullYear()}`;
  }
  return `${fmt(s, { month: 'short', day: 'numeric', year: 'numeric' })} – ${fmt(e, { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

/** "13:30" -> "01:30 PM" */
export const formatTime = (t) => {
  if (typeof t !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${pad(h % 12 === 0 ? 12 : h % 12)}:${pad(m)} ${ap}`;
};
export const isValidTime = (t) => typeof t === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
