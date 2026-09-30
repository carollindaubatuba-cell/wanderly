import { normalizeTrip } from './schema.js';
import { cloneTrip } from '../data/defaults.js';
import { nowISO } from './ids.js';

const MAX_BYTES = 5 * 1024 * 1024;

export const buildExport = (trips) => ({
  app: 'wanderly',
  version: 1,
  exportedAt: nowISO(),
  trips,
});

export function downloadJSON(filename, data) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

export const safeFileName = (s) =>
  (String(s || 'trip').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'trip');

/**
 * Validate an exported Wanderly file. Returns fresh copies of the trips (new ids,
 * so importing never overwrites an existing trip) or throws a friendly Error.
 */
export function parseImport(text, size = text.length) {
  if (size > MAX_BYTES) throw new Error('That file is too large to be a Wanderly backup (5 MB max).');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON. Choose a file exported from Wanderly.');
  }
  if (!data || typeof data !== 'object') throw new Error('That file is not a Wanderly export.');
  let rawTrips;
  if (Array.isArray(data.trips)) rawTrips = data.trips;
  else if (data.app === 'wanderly' && data.trip) rawTrips = [data.trip];
  else if (data.name && data.startDate) rawTrips = [data];
  else throw new Error('That file is not a Wanderly export.');
  if (!rawTrips.length) throw new Error('That backup does not contain any trips.');
  if (rawTrips.length > 200) throw new Error('That backup contains too many trips.');
  return rawTrips.map((r) => {
    const t = normalizeTrip(r); // throws with a friendly message if unusable
    return { ...cloneTrip(t), name: t.name, isDemo: false };
  });
}
