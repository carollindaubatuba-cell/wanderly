import { useMemo, useState } from 'react';
import { Plus, Ticket } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { BookingCard } from '../components/cards.jsx';
import { BookingForm } from '../components/forms.jsx';
import { Button, EmptyState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { BOOKING_TYPES } from '../data/constants.js';
import { uid } from '../utils/ids.js';

export default function Bookings() {
  const { trip, upsert, remove, toast } = useStore();
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);

  const list = useMemo(
    () =>
      trip.bookings
        .filter((b) => filter === 'All' || b.type === filter)
        .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || (a.time || '').localeCompare(b.time || '')),
    [trip.bookings, filter]
  );

  const save = (values) => {
    if (form.booking) { upsert('bookings', { ...form.booking, ...values }); toast('Booking updated'); }
    else { upsert('bookings', { id: uid(), ...values }); toast('Booking added'); }
    setForm(null);
  };

  return (
    <div className="page">
      <PageHeader title="Bookings" tripName={trip.name} subtitle="Every reservation and confirmation, in one place.">
        <Button icon={Plus} onClick={() => setForm({ booking: null })}>Add Booking</Button>
      </PageHeader>

      {trip.bookings.length === 0 ? (
        <EmptyState icon={Ticket} title="No bookings yet." text="Keep your reservations organized in one place." action={<Button icon={Plus} onClick={() => setForm({ booking: null })}>Add Booking</Button>} />
      ) : (
        <>
          <div className="chips" role="group" aria-label="Filter bookings by type">
            {['All', ...BOOKING_TYPES.map((t) => t.id)].map((t) => (
              <button key={t} type="button" className={`chip ${filter === t ? 'active' : ''}`} aria-pressed={filter === t} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
          {list.length === 0 ? (
            <p className="muted">No {filter.toLowerCase()} bookings yet.</p>
          ) : (
            <div className="card-grid">
              {list.map((b) => (
                <BookingCard key={b.id} booking={b} currency={trip.currency} onEdit={() => setForm({ booking: b })} onDelete={() => setDel(b)} />
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.booking ? 'Edit booking' : 'Add booking'} size="lg">
        {form && <BookingForm key={form.booking?.id || 'new'} initial={form.booking} onSubmit={save} onCancel={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete this booking?" message={del ? `“${del.name}” will be removed from your bookings.` : ''} confirmLabel="Delete booking" danger onConfirm={() => { remove('bookings', del.id); setDel(null); toast('Booking deleted'); }} />
    </div>
  );
}
