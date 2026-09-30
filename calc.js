import { parseISO, diffDays, startOfToday } from './dates.js';

export const sum = (arr, f) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0);

export function tripDays(t) {
  const s = parseISO(t.startDate);
  const e = parseISO(t.endDate);
  if (!s || !e || e < s) return 0;
  return diffDays(s, e) + 1;
}
export const tripNights = (t) => Math.max(0, tripDays(t) - 1);

export function getCountdown(t) {
  const s = parseISO(t.startDate);
  const e = parseISO(t.endDate);
  if (!s || !e) return null;
  const today = startOfToday();
  const d = diffDays(today, s);
  if (d > 0) return { state: 'upcoming', days: d, label: `${d} ${d === 1 ? 'day' : 'days'} to go` };
  if (d === 0) return { state: 'today', days: 0, label: 'Starts today' };
  if (today <= e) return { state: 'active', days: 0, label: 'Happening now' };
  return { state: 'past', days: 0, label: 'Completed' };
}

export function budgetTotals(t) {
  const planned = sum(t.budgetCategories, (c) => c.planned);
  const actual = sum(t.budgetCategories, (c) => c.actual);
  const total = Number(t.budget) || 0;
  const remaining = total - actual;
  const travelers = Math.max(1, Number(t.travelers) || 1);
  return {
    total,
    planned,
    actual,
    remaining,
    over: remaining < 0,
    pctUsed: total > 0 ? Math.min(100, (actual / total) * 100) : 0,
    pctPlanned: total > 0 ? Math.min(100, (planned / total) * 100) : 0,
    perTravelerPlanned: planned / travelers,
    perTravelerActual: actual / travelers,
  };
}

export function packingProgress(t) {
  const items = t.packingCategories.flatMap((c) => c.items);
  const packed = items.filter((i) => i.packed).length;
  return { total: items.length, packed, pct: items.length ? (packed / items.length) * 100 : 0 };
}

export const dayCost = (t, dayIndex) =>
  sum(t.activities.filter((a) => a.dayIndex === dayIndex), (a) => a.cost);

export const activitiesCost = (t) => sum(t.activities, (a) => a.cost);

export function planningProgress(t) {
  const days = Math.max(1, tripDays(t));
  const daysWithPlans = new Set(t.activities.map((a) => a.dayIndex)).size;
  const pack = packingProgress(t);
  const bt = budgetTotals(t);
  const hasEmergency = Object.values(t.emergencyInfo || {}).some((v) => String(v).trim());
  const parts = [
    { key: 'itinerary', label: 'Itinerary', weight: 25, value: Math.min(1, daysWithPlans / days), note: `${daysWithPlans} of ${days} days planned` },
    { key: 'bookings', label: 'Bookings', weight: 15, value: Math.min(1, t.bookings.length / 3), note: `${t.bookings.length} saved` },
    { key: 'budget', label: 'Budget', weight: 15, value: bt.planned > 0 ? 1 : 0, note: bt.planned > 0 ? 'Amounts planned' : 'Add planned amounts' },
    { key: 'packing', label: 'Packing', weight: 25, value: pack.total ? pack.packed / pack.total : 0, note: `${pack.packed} of ${pack.total} packed` },
    { key: 'places', label: 'Places', weight: 10, value: Math.min(1, t.places.length / 3), note: `${t.places.length} saved` },
    { key: 'essentials', label: 'Documents and emergency info', weight: 10, value: (hasEmergency ? 0.5 : 0) + (t.documents.length ? 0.5 : 0), note: hasEmergency || t.documents.length ? 'Started' : 'Not started' },
  ];
  const pct = Math.round(parts.reduce((a, p) => a + p.weight * p.value, 0));
  return { pct, parts };
}

/** Keep activities on real days after a trip's dates change. */
export function reconcileTrip(t) {
  const days = tripDays(t);
  if (!days) return t;
  const last = days - 1;
  if (!t.activities.some((a) => a.dayIndex > last)) return t;
  return { ...t, activities: t.activities.map((a) => (a.dayIndex > last ? { ...a, dayIndex: last } : a)) };
}

export const byTime = (a, b) => {
  if (!a.time && !b.time) return 0;
  if (!a.time) return 1;
  if (!b.time) return -1;
  return a.time.localeCompare(b.time);
};
