const cache = new Map();

export function money(amount, currency = 'USD') {
  const v = Number(amount);
  const n = Number.isFinite(v) ? v : 0;
  const whole = Number.isInteger(n);
  const key = `${currency}|${whole}`;
  try {
    if (!cache.has(key)) {
      cache.set(
        key,
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: whole ? 0 : 2,
          maximumFractionDigits: 2,
        })
      );
    }
    return cache.get(key).format(n);
  } catch {
    return `${currency} ${n.toFixed(whole ? 0 : 2)}`;
  }
}

export function currencySymbol(currency = 'USD') {
  try {
    const part = new Intl.NumberFormat('en-US', { style: 'currency', currency })
      .formatToParts(0)
      .find((p) => p.type === 'currency');
    return part ? part.value : currency;
  } catch {
    return currency;
  }
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Accepts "example.com" or "https://example.com"; returns a safe http(s) URL or "". */
export function normalizeUrl(v) {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  if (!s) return '';
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : '';
  } catch {
    return '';
  }
}
