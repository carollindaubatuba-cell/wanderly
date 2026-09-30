import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { TripHero } from '../components/cards.jsx';
import { Button, Card, IconButton } from '../components/ui.jsx';
import { getCountdown, tripDays } from '../utils/calc.js';
import { formatRange, parseISO, toISO, addDays } from '../utils/dates.js';
import { plural } from '../utils/format.js';

function MiniCalendar({ trip, mondayStart }) {
  const s = parseISO(trip.startDate);
  const e = parseISO(trip.endDate);
  const [cursor, setCursor] = useState(() => new Date(s.getFullYear(), s.getMonth(), 1));
  const first = cursor;
  const offset = (first.getDay() - (mondayStart ? 1 : 0) + 7) % 7;
  const gridStart = addDays(first, -offset);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const heads = mondayStart ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const title = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  return (
    <Card className="cal">
      <div className="cal-head">
        <h3 className="cal-title" aria-live="polite">{title}</h3>
        <div>
          <IconButton icon={ChevronLeft} label="Previous month" onClick={() => shift(-1)} />
          <IconButton icon={ChevronRight} label="Next month" onClick={() => shift(1)} />
        </div>
      </div>
      <div className="cal-grid" role="grid" aria-label={`Calendar for ${title}`}>
        {heads.map((h, i) => <span key={i} className="cal-dow" role="columnheader">{h}</span>)}
        {cells.map((d) => {
          const inMonth = d.getMonth() === first.getMonth();
          const inTrip = d >= s && d <= e;
          const edge = inTrip && (d.getTime() === s.getTime() || d.getTime() === e.getTime());
          return (
            <span key={toISO(d)} role="gridcell" aria-selected={inTrip || undefined} className={`cal-day ${inMonth ? '' : 'out'} ${inTrip ? 'in-trip' : ''} ${edge ? 'edge' : ''}`}>
              {d.getDate()}
              {inTrip && <span className="sr-only"> (trip day)</span>}
            </span>
          );
        })}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { trip, trips, openTrip, openTripModal, settings } = useStore();
  const others = trips.filter((t) => t.id !== trip.id).sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 4);
  return (
    <div className="page">
      <PageHeader title="Ready for your next adventure?" subtitle={`You have ${plural(trips.length, 'trip')} in your planner.`}>
        <Button icon={Plus} onClick={() => openTripModal()}>New trip</Button>
      </PageHeader>
      <TripHero trip={trip}>
        <Button variant="light" size="lg" onClick={() => openTrip(trip.id)}>Open Trip</Button>
      </TripHero>
      <div className="dash-grid">
        <MiniCalendar key={trip.id} trip={trip} mondayStart={settings.weekStartsMonday} />
        <Card className="dash-list">
          <h3 className="card-title">{others.length ? 'Other trips' : 'More adventures'}</h3>
          {others.length ? (
            <ul className="mini-trips">
              {others.map((t) => {
                const cd = getCountdown(t);
                return (
                  <li key={t.id}>
                    <button type="button" onClick={() => openTrip(t.id)}>
                      <span className="mini-name">{t.name}</span>
                      <span className="mini-sub">{formatRange(t.startDate, t.endDate)} · {plural(tripDays(t), 'day')}</span>
                      {settings.showCountdown && cd && <span className="mini-count">{cd.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">Planning somewhere else next? Add another trip and switch between them any time.</p>
          )}
          <a className="link-quiet" href="#/trips">See all trips</a>
        </Card>
      </div>
    </div>
  );
}
