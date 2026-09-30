import { DEFAULT_SETTINGS, CURRENCIES } from '../data/constants.js';
import { normalizeTrip } from './schema.js';

export const KEYS = {
  trips: 'wanderly_trips',
  settings: 'wanderly_settings',
  current: 'wanderly_current_trip',
};

export function readJSON(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function loadTrips() {
  const raw = readJSON(KEYS.trips);
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const r of raw) {
    try {
      out.push(normalizeTrip(r));
    } catch {
      /* skip a damaged trip instead of crashing */
    }
  }
  return out;
}

export function loadSettings() {
  const raw = readJSON(KEYS.settings);
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    theme: s.theme === 'dark' ? 'dark' : 'light',
    currency: CURRENCIES.includes(s.currency) ? s.currency : DEFAULT_SETTINGS.currency,
    weekStartsMonday: s.weekStartsMonday === true,
    showCountdown: s.showCountdown !== false,
    autoSave: s.autoSave !== false,
  };
}
