import { parseISO, diffDays, isValidTime } from './dates.js';
import { normalizeUrl } from './format.js';

const parseAmount = (s) => {
  const t = String(s ?? '').trim().replace(/,/g, '');
  if (t === '') return { ok: true, value: 0, blank: true };
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n < 1e12 ? { ok: true, value: Math.round(n * 100) / 100 } : { ok: false };
};
export { parseAmount };

export function validateTrip(f) {
  const errors = {};
  const name = f.name.trim();
  const destination = f.destination.trim();
  if (!name) errors.name = 'Please enter a trip name.';
  if (!destination) errors.destination = 'Please enter a destination.';
  const s = parseISO(f.startDate);
  const e = parseISO(f.endDate);
  if (!s) errors.startDate = 'Please enter a valid date.';
  if (!e) errors.endDate = 'Please enter a valid date.';
  if (s && e) {
    if (e < s) errors.endDate = 'End date must be on or after the start date.';
    else if (diffDays(s, e) + 1 > 365) errors.endDate = 'Trips can be up to 365 days long.';
  }
  const tr = Number(f.travelers);
  if (!Number.isInteger(tr) || tr < 1 || tr > 99) errors.travelers = 'Enter a whole number from 1 to 99.';
  const b = parseAmount(f.budget);
  if (!b.ok) errors.budget = 'Enter a valid budget (0 or more).';
  let coverImage = '';
  if (f.coverImage.trim()) {
    coverImage = normalizeUrl(f.coverImage);
    if (!coverImage) errors.coverImage = 'Enter a web address that starts with http:// or https://.';
  }
  return {
    errors,
    values: {
      name, destination, country: f.country.trim(), startDate: f.startDate, endDate: f.endDate,
      travelers: tr, budget: b.ok ? b.value : 0, currency: f.currency,
      description: f.description.trim(), coverImage,
    },
  };
}

export function validateActivity(f, maxDay) {
  const errors = {};
  if (!f.title.trim()) errors.title = 'Please enter a title.';
  if (f.time && !isValidTime(f.time)) errors.time = 'Please enter a valid time.';
  const c = parseAmount(f.cost);
  if (!c.ok) errors.cost = 'Enter a valid amount (0 or more).';
  const day = Number(f.dayIndex);
  if (!Number.isInteger(day) || day < 0 || day > maxDay) errors.dayIndex = 'Choose a day.';
  return {
    errors,
    values: {
      dayIndex: day, time: f.time || '', title: f.title.trim(), category: f.category,
      location: f.location.trim(), notes: f.notes.trim(), cost: c.ok ? c.value : 0, reservation: f.reservation.trim(),
    },
  };
}

export function validateBooking(f) {
  const errors = {};
  if (!f.name.trim()) errors.name = 'Please enter a booking name.';
  if (f.date && !parseISO(f.date)) errors.date = 'Please enter a valid date.';
  if (f.endDate) {
    if (!parseISO(f.endDate)) errors.endDate = 'Please enter a valid date.';
    else if (parseISO(f.date) && parseISO(f.endDate) < parseISO(f.date)) errors.endDate = 'End date must be on or after the start date.';
  }
  if (f.time && !isValidTime(f.time)) errors.time = 'Please enter a valid time.';
  const c = parseAmount(f.cost);
  if (!c.ok) errors.cost = 'Enter a valid amount (0 or more).';
  let website = '';
  if (f.website.trim()) {
    website = normalizeUrl(f.website);
    if (!website) errors.website = 'Enter a valid web address.';
  }
  return {
    errors,
    values: {
      type: f.type, name: f.name.trim(), date: f.date, endDate: f.endDate, time: f.time,
      location: f.location.trim(), provider: f.provider.trim(), confirmation: f.confirmation.trim(),
      address: f.address.trim(), phone: f.phone.trim(), website, cost: c.ok ? c.value : 0, notes: f.notes.trim(),
    },
  };
}
