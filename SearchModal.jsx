import { useMemo, useState } from 'react';
import { Search, CalendarDays, MapPin, Ticket, NotebookPen, Backpack } from 'lucide-react';
import { Modal } from './ui.jsx';
import { useStore } from '../hooks/useStore.jsx';

const has = (q, ...fields) => fields.some((f) => String(f || '').toLowerCase().includes(q));

export default function SearchModal() {
  const { searchOpen, setSearchOpen, trip, navigate } = useStore();
  const [q, setQ] = useState('');
  const close = () => { setSearchOpen(false); setQ(''); };

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!trip || s.length < 1) return [];
    const go = (route) => () => { close(); navigate(route); };
    return [
      { label: 'Itinerary', icon: CalendarDays, route: 'itinerary', items: trip.activities.filter((a) => has(s, a.title, a.location, a.notes, a.category, a.reservation)).map((a) => ({ id: a.id, title: a.title, sub: `Day ${a.dayIndex + 1}${a.location ? ` · ${a.location}` : ''}` })) },
      { label: 'Places', icon: MapPin, route: 'places', items: trip.places.filter((p) => has(s, p.name, p.location, p.notes, p.category)).map((p) => ({ id: p.id, title: p.name, sub: [p.category, p.location].filter(Boolean).join(' · ') })) },
      { label: 'Bookings', icon: Ticket, route: 'bookings', items: trip.bookings.filter((b) => has(s, b.name, b.location, b.provider, b.confirmation, b.type, b.notes)).map((b) => ({ id: b.id, title: b.name, sub: b.type })) },
      { label: 'Notes', icon: NotebookPen, route: 'notes', items: trip.notes.filter((n) => has(s, n.title, n.content)).map((n) => ({ id: n.id, title: n.title, sub: n.content.slice(0, 70) })) },
      { label: 'Packing', icon: Backpack, route: 'packing', items: trip.packingCategories.flatMap((c) => c.items.filter((i) => has(s, i.name)).map((i) => ({ id: i.id, title: i.name, sub: c.name }))) },
    ].filter((g) => g.items.length).map((g) => ({ ...g, go: go(g.route) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, trip]);

  const total = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <Modal open={searchOpen} onClose={close} title="Search this trip" size="md">
      {!trip ? (
        <p className="muted">Create a trip first, then you can search its activities, places, bookings, notes and packing items.</p>
      ) : (
        <>
          <div className="search-input">
            <Search size={18} aria-hidden="true" />
            <input className="input" type="search" aria-label="Search activities, places, bookings, notes and packing items" placeholder="Try “restaurant”" value={q} onChange={(e) => setQ(e.target.value)} data-autofocus />
          </div>
          <div className="search-results" aria-live="polite">
            {q.trim() && total === 0 && <p className="muted search-empty">No matches for “{q.trim()}”.</p>}
            {groups.map((g) => {
              const Icon = g.icon;
              return (
                <section key={g.label} className="search-group">
                  <h3><Icon size={15} aria-hidden="true" />{g.label}</h3>
                  <ul>
                    {g.items.slice(0, 8).map((it) => (
                      <li key={it.id}>
                        <a href={`#/${g.route}`} onClick={g.go}>
                          <span className="sr-title">{it.title}</span>
                          {it.sub && <span className="sr-sub">{it.sub}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
