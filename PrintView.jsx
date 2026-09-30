import { createPortal } from 'react-dom';
import { tripDays, tripNights, budgetTotals, packingProgress, byTime } from '../utils/calc.js';
import { formatRange, formatTime, formatWeekday, parseISO, addDays, formatShort } from '../utils/dates.js';
import { money, plural } from '../utils/format.js';

/** Clean, ink-friendly layout. Hidden on screen, shown only by @media print. */
export default function PrintView({ trip }) {
  const host = document.getElementById('print-root');
  if (!host || !trip) return null;
  const cur = trip.currency;
  const bt = budgetTotals(trip);
  const pk = packingProgress(trip);
  const start = parseISO(trip.startDate);
  return createPortal(
    <div className="print-doc">
      <h1>{trip.name}</h1>
      <p className="print-sub">
        {[trip.destination, trip.country].filter(Boolean).join(', ')} · {formatRange(trip.startDate, trip.endDate)} · {plural(tripDays(trip), 'day')}, {plural(tripNights(trip), 'night')} · {plural(trip.travelers, 'traveler')}
      </p>
      {trip.description && <p>{trip.description}</p>}

      <h2>Itinerary</h2>
      {trip.activities.length === 0 && <p>No activities yet.</p>}
      {Array.from({ length: tripDays(trip) }, (_, i) => {
        const list = trip.activities.filter((a) => a.dayIndex === i).sort(byTime);
        if (!list.length) return null;
        return (
          <section key={i} className="print-day">
            <h3>Day {i + 1} · {formatWeekday(addDays(start, i))}</h3>
            <table>
              <tbody>
                {list.map((a) => (
                  <tr key={a.id}>
                    <td className="t">{formatTime(a.time) || '—'}</td>
                    <td><strong>{a.title}</strong>{a.location ? ` — ${a.location}` : ''}{a.reservation ? ` (Reservation: ${a.reservation})` : ''}{a.notes ? <div className="n">{a.notes}</div> : null}</td>
                    <td className="c">{a.cost > 0 ? money(a.cost, cur) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      <h2>Bookings</h2>
      {trip.bookings.length === 0 ? <p>No bookings yet.</p> : (
        <table>
          <tbody>
            {[...trip.bookings].sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((b) => (
              <tr key={b.id}>
                <td className="t">{b.type}</td>
                <td><strong>{b.name}</strong>{b.date ? ` · ${formatShort(b.date)}${b.endDate && b.endDate !== b.date ? ` – ${formatShort(b.endDate)}` : ''}` : ''}{b.time ? ` ${formatTime(b.time)}` : ''}{b.confirmation ? ` · Confirmation ${b.confirmation}` : ''}</td>
                <td className="c">{b.cost > 0 ? money(b.cost, cur) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Budget</h2>
      <p>Total {money(bt.total, cur)} · Planned {money(bt.planned, cur)} · Actual {money(bt.actual, cur)} · {bt.over ? `Over by ${money(-bt.remaining, cur)}` : `Remaining ${money(bt.remaining, cur)}`}</p>
      <table>
        <thead><tr><th>Category</th><th className="c">Planned</th><th className="c">Actual</th></tr></thead>
        <tbody>
          {trip.budgetCategories.map((c) => (
            <tr key={c.id}><td>{c.name}</td><td className="c">{money(c.planned, cur)}</td><td className="c">{money(c.actual, cur)}</td></tr>
          ))}
        </tbody>
      </table>

      <h2>Packing list ({pk.packed} of {pk.total} packed)</h2>
      <div className="print-pack">
        {trip.packingCategories.map((c) => (
          <div key={c.id} className="print-pack-cat">
            <h3>{c.name}</h3>
            <ul>{c.items.map((i) => <li key={i.id}>{i.packed ? '☑' : '☐'} {i.name}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="print-foot">Printed from Wanderly Travel Planner</p>
    </div>,
    host
  );
}
