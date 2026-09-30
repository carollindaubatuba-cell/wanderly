import { uid, nowISO } from '../utils/ids.js';
import { DEFAULT_BUDGET_NAMES, DEFAULT_PACKING, EMERGENCY_FIELDS } from './constants.js';

export const emptyEmergency = () => Object.fromEntries(EMERGENCY_FIELDS.map((f) => [f.key, '']));

export const defaultBudgetCategories = () =>
  DEFAULT_BUDGET_NAMES.map((name) => ({ id: uid(), name, planned: 0, actual: 0, custom: false }));

export const defaultPackingCategories = () =>
  DEFAULT_PACKING.map(([name, items]) => ({
    id: uid(),
    name,
    items: items.map((n) => ({ id: uid(), name: n, packed: false })),
  }));

export function makeTrip(fields = {}) {
  const now = nowISO();
  return {
    id: uid(),
    name: fields.name || '',
    destination: fields.destination || '',
    country: fields.country || '',
    startDate: fields.startDate || '',
    endDate: fields.endDate || '',
    travelers: fields.travelers || 1,
    budget: fields.budget || 0,
    currency: fields.currency || 'USD',
    description: fields.description || '',
    coverImage: fields.coverImage || '',
    activities: [],
    bookings: [],
    budgetCategories: defaultBudgetCategories(),
    packingCategories: defaultPackingCategories(),
    places: [],
    notes: [],
    documents: [],
    emergencyInfo: emptyEmergency(),
    createdAt: now,
    updatedAt: now,
    isDemo: false,
  };
}

const reid = (list) => list.map((x) => ({ ...x, id: uid() }));

/** Deep copy with fresh ids, used by "Duplicate trip". */
export function cloneTrip(t) {
  const now = nowISO();
  return {
    ...JSON.parse(JSON.stringify(t)),
    id: uid(),
    name: `${t.name} (copy)`,
    isDemo: false,
    activities: reid(t.activities),
    bookings: reid(t.bookings),
    budgetCategories: reid(t.budgetCategories),
    packingCategories: t.packingCategories.map((c) => ({ ...c, id: uid(), items: reid(c.items) })),
    places: reid(t.places),
    notes: reid(t.notes),
    documents: reid(t.documents),
    createdAt: now,
    updatedAt: now,
  };
}

/** Everything the user added, back to a clean slate (basic trip details stay). */
export function clearedTripData(t) {
  return {
    ...t,
    activities: [],
    bookings: [],
    budgetCategories: defaultBudgetCategories(),
    packingCategories: defaultPackingCategories(),
    places: [],
    notes: [],
    documents: [],
    emergencyInfo: emptyEmergency(),
    updatedAt: nowISO(),
  };
}
