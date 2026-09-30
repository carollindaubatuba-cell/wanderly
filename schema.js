import { uid, nowISO } from '../utils/ids.js';
import { parseISO, isValidTime } from './dates.js';
import { tripDays } from './calc.js';
import { normalizeUrl } from './format.js';
import {
  CURRENCIES, ACTIVITY_CATEGORIES, BOOKING_TYPES, PLACE_CATEGORIES, DOC_TYPES, EMERGENCY_FIELDS,
} from '../data/constants.js';
import { defaultBudgetCategories, defaultPackingCategories, emptyEmergency } from '../data/defaults.js';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const str = (v, max = 5000) => (typeof v === 'string' ? v.slice(0, max) : typeof v === 'number' && isFinite(v) ? String(v) : '');
const num = (v, def = 0) => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  return typeof n === 'number' && isFinite(n) && n >= 0 && n < 1e12 ? n : def;
};
const pick = (v, list, def) => (list.includes(v) ? v : def);
const objs = (v, cap = 2000) => (Array.isArray(v) ? v.filter(isObj).slice(0, cap) : []);
const makeUnique = () => {
  const seen = new Set();
  return (v) => {
    let id = typeof v === 'string' && v && v.length <= 64 ? v : uid();
    while (seen.has(id)) id = uid();
    seen.add(id);
    return id;
  };
};
const isoStamp = (v) => (typeof v === 'string' && !isNaN(Date.parse(v)) ? v : nowISO());

/**
 * Turn unknown data (localStorage or an imported file) into a safe trip.
 * Throws an Error with a friendly message when the trip can't be used at all.
 */
export function normalizeTrip(raw) {
  if (!isObj(raw)) throw new Error('This file does not contain a valid Wanderly trip.');
  const name = str(raw.name, 120).trim();
  const destination = str(raw.destination, 120).trim();
  if (!name && !destination) throw new Error('A trip is missing its name.');
  const s = parseISO(raw.startDate);
  const e = parseISO(raw.endDate);
  if (!s || !e) throw new Error(`"${name || destination}" has missing or invalid dates.`);
  if (e < s) throw new Error(`"${name || destination}" ends before it starts.`);

  const travelersN = Math.round(num(raw.travelers, 1));
  const base = {
    id: typeof raw.id === 'string' && raw.id ? raw.id.slice(0, 64) : uid(),
    name: name || destination,
    destination: destination || name,
    country: str(raw.country, 120),
    startDate: raw.startDate,
    endDate: raw.endDate,
    travelers: Math.min(99, Math.max(1, travelersN || 1)),
    budget: num(raw.budget, 0),
    currency: pick(raw.currency, CURRENCIES, 'USD'),
    description: str(raw.description, 2000),
    coverImage: normalizeUrl(str(raw.coverImage, 2000)),
    createdAt: isoStamp(raw.createdAt),
    updatedAt: isoStamp(raw.updatedAt),
    isDemo: raw.isDemo === true,
  };
  const days = tripDays(base);
  if (days > 366) throw new Error(`"${base.name}" is longer than 366 days.`);

  const actId = makeUnique();
  const activities = objs(raw.activities).map((a) => ({
    id: actId(a.id),
    dayIndex: Math.min(days - 1, Math.max(0, Math.round(num(a.dayIndex, 0)))),
    time: isValidTime(a.time) ? a.time : '',
    title: str(a.title, 160) || 'Untitled activity',
    category: pick(a.category, ACTIVITY_CATEGORIES.map((c) => c.id), 'Other'),
    location: str(a.location, 200),
    notes: str(a.notes, 2000),
    cost: num(a.cost, 0),
    reservation: str(a.reservation, 200),
  }));

  const bookId = makeUnique();
  const bookings = objs(raw.bookings).map((b) => ({
    id: bookId(b.id),
    type: pick(b.type, BOOKING_TYPES.map((c) => c.id), 'Other'),
    name: str(b.name, 160) || 'Untitled booking',
    date: parseISO(b.date) ? b.date : '',
    endDate: parseISO(b.endDate) ? b.endDate : '',
    time: isValidTime(b.time) ? b.time : '',
    location: str(b.location, 200),
    provider: str(b.provider, 160),
    confirmation: str(b.confirmation, 120),
    address: str(b.address, 300),
    phone: str(b.phone, 60),
    website: normalizeUrl(str(b.website, 500)),
    cost: num(b.cost, 0),
    notes: str(b.notes, 2000),
  }));

  const catId = makeUnique();
  const budgetCategories = Array.isArray(raw.budgetCategories)
    ? objs(raw.budgetCategories, 100).map((c) => ({
        id: catId(c.id),
        name: str(c.name, 60) || 'Category',
        planned: num(c.planned, 0),
        actual: num(c.actual, 0),
        custom: c.custom === true,
      }))
    : defaultBudgetCategories();

  const pcId = makeUnique();
  const itemId = makeUnique();
  const packingCategories = Array.isArray(raw.packingCategories)
    ? objs(raw.packingCategories, 100).map((c) => ({
        id: pcId(c.id),
        name: str(c.name, 60) || 'Category',
        items: objs(c.items, 500).map((i) => ({ id: itemId(i.id), name: str(i.name, 100) || 'Item', packed: i.packed === true })),
      }))
    : defaultPackingCategories();

  const plId = makeUnique();
  const places = objs(raw.places).map((p) => ({
    id: plId(p.id),
    name: str(p.name, 160) || 'Untitled place',
    category: pick(p.category, PLACE_CATEGORIES.map((c) => c.id), 'Attractions'),
    location: str(p.location, 200),
    cost: str(p.cost, 60),
    notes: str(p.notes, 2000),
    visited: p.visited === true,
  }));

  const nId = makeUnique();
  const notes = objs(raw.notes).map((n) => ({
    id: nId(n.id),
    title: str(n.title, 160) || 'Untitled note',
    content: str(n.content, 20000),
    createdAt: isoStamp(n.createdAt),
    updatedAt: isoStamp(n.updatedAt),
  }));

  const dId = makeUnique();
  const documents = objs(raw.documents).map((d) => ({
    id: dId(d.id),
    type: pick(d.type, DOC_TYPES.map((t) => t.id), 'Other'),
    label: str(d.label, 120) || 'Untitled',
    value: str(d.value, 2000),
  }));

  const emergencyInfo = emptyEmergency();
  if (isObj(raw.emergencyInfo)) {
    for (const f of EMERGENCY_FIELDS) emergencyInfo[f.key] = str(raw.emergencyInfo[f.key], 300);
  }

  return { ...base, activities, bookings, budgetCategories, packingCategories, places, notes, documents, emergencyInfo };
}
