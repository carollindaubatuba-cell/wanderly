import { useState } from 'react';

const PALETTES = [
  ['#4E6553', '#8FA38E'],
  ['#7A6553', '#C2AB93'],
  ['#4F6374', '#94A9B8'],
  ['#655B6C', '#B0A2B2'],
  ['#636A47', '#ADB388'],
];
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** Gradient (or photo) cover with a soft contour-line pattern and a legibility scrim. */
export default function Cover({ trip, className = '', children }) {
  const [broken, setBroken] = useState(false);
  const [a, b] = PALETTES[hash(trip.destination || trip.name) % PALETTES.length];
  const showImg = trip.coverImage && !broken;
  return (
    <div className={`cover ${className}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {showImg && <img className="cover-img" src={trip.coverImage} alt="" loading="lazy" onError={() => setBroken(true)} />}
      <div className="cover-contours" aria-hidden="true" />
      <div className="cover-scrim" aria-hidden="true" />
      <div className="cover-content">{children}</div>
    </div>
  );
}
