import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { ActivityCard } from '../components/cards.jsx';
import { ActivityForm } from '../components/forms.jsx';
import { Button, EmptyState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { tripDays, dayCost, byTime } from '../utils/calc.js';
import { parseISO, addDays, toISO, formatShort, formatWeekday } from '../utils/dates.js';
import { money, plural } from '../utils/format.js';
import { uid } from '../utils/ids.js';

export default function Itinerary() {
  const { trip, upsert, remove, toast } = useStore();
  const days = tripDays(trip);
  const start = parseISO(trip.startDate);
  const [day, setDay] = useState(0);
  const [form, setForm] = useState(null); // { activity|null }
  const [del, setDel] = useState(null);
  const tabsRef = useRef(null);
  const current = Math.min(day, Math.max(0, days - 1));

  const list = useMemo(() => trip.activities.filter((a) => a.dayIndex === current).sort(byTime), [trip.activities, current]);
  const date = addDays(start, current);

  useEffect(() => {
    tabsRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [current]);

  const onKeyTabs = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = Math.min(days - 1, Math.max(0, current + (e.key === 'ArrowRight' ? 1 : -1)));
      setDay(n);
      requestAnimationFrame(() => tabsRef.current?.querySelector(`#day-tab-${n}`)?.focus());
    }
  };

  const save = (values) => {
    if (form.activity) {
      upsert('activities', { ...form.activity, ...values });
      toast('Activity updated');
    } else {
      upsert('activities', { id: uid(), ...values });
      toast('Activity added');
    }
    setDay(values.dayIndex);
    setForm(null);
  };

  return (
    <div className="page">
      <PageHeader title="Itinerary" tripName={trip.name}>
        <Button icon={Plus} onClick={() => setForm({ activity: null })}>Add Activity</Button>
      </PageHeader>

      <div className="day-tabs" role="tablist" aria-label="Trip days" ref={tabsRef} onKeyDown={onKeyTabs}>
        {Array.from({ length: days }, (_, i) => {
          const n = trip.activities.filter((a) => a.dayIndex === i).length;
          const on = i === current;
          return (
            <button key={i} id={`day-tab-${i}`} role="tab" type="button" aria-selected={on} aria-controls="day-panel" tabIndex={on ? 0 : -1} className={`day-tab ${on ? 'active' : ''}`} onClick={() => setDay(i)}>
              <span className="day-tab-name">Day {i + 1}</span>
              <span className="day-tab-date">{formatShort(toISO(addDays(start, i)))}</span>
              <span className="day-tab-count" aria-label={plural(n, 'activity', 'activities')}>{n}</span>
            </button>
          );
        })}
      </div>

      <section id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${current}`} className="day-panel">
        <div className="day-head">
          <div>
            <h2 className="day-title">Day {current + 1}</h2>
            <p className="day-date">{formatWeekday(date)}</p>
          </div>
          <div className="day-cost">
            <span>Day {current + 1} estimated</span>
            <strong>{money(dayCost(trip, current), trip.currency)}</strong>
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Your days are still wide open."
            text="Add your first activity."
            action={<Button icon={Plus} onClick={() => setForm({ activity: null })}>Add Activity</Button>}
          />
        ) : (
          <ol className="timeline">
            {list.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                currency={trip.currency}
                days={days}
                startDate={trip.startDate}
                onEdit={() => setForm({ activity: a })}
                onDuplicate={() => { upsert('activities', { ...a, id: uid(), title: `${a.title} (copy)` }); toast('Activity duplicated'); }}
                onDelete={() => setDel(a)}
                onMove={(d) => { upsert('activities', { ...a, dayIndex: d }); toast(`Moved to Day ${d + 1}`); }}
              />
            ))}
          </ol>
        )}
        {list.length > 0 && (
          <div className="day-foot">
            <Button variant="secondary" icon={Plus} onClick={() => setForm({ activity: null })}>Add Activity</Button>
          </div>
        )}
      </section>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.activity ? 'Edit activity' : 'Add activity'} size="lg">
        {form && <ActivityForm key={form.activity?.id || 'new'} trip={trip} initial={form.activity} dayIndex={current} onSubmit={save} onCancel={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete this activity?"
        message={del ? `“${del.title}” will be removed from Day ${del.dayIndex + 1}.` : ''}
        confirmLabel="Delete activity"
        danger
        onConfirm={() => { remove('activities', del.id); setDel(null); toast('Activity deleted'); }}
      />
    </div>
  );
}
