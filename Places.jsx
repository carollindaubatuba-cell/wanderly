import { useMemo, useState } from 'react';
import { Plus, MapPin } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { PlaceCard } from '../components/cards.jsx';
import { PlaceForm } from '../components/forms.jsx';
import { Button, EmptyState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { PLACE_CATEGORIES } from '../data/constants.js';
import { uid } from '../utils/ids.js';

export default function Places() {
  const { trip, upsert, remove, toast } = useStore();
  const [cat, setCat] = useState('All');
  const [status, setStatus] = useState('all');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);

  const list = useMemo(
    () => trip.places.filter((p) => (cat === 'All' || p.category === cat) && (status === 'all' || (status === 'visited') === p.visited)),
    [trip.places, cat, status]
  );
  const visited = trip.places.filter((p) => p.visited).length;

  const save = (values) => {
    if (form.place) { upsert('places', { ...form.place, ...values }); toast('Place updated'); }
    else { upsert('places', { id: uid(), ...values }); toast('Place added'); }
    setForm(null);
  };

  return (
    <div className="page">
      <PageHeader title="Places to Explore" tripName={trip.name} subtitle={trip.places.length ? `${visited} of ${trip.places.length} visited` : undefined}>
        <Button icon={Plus} onClick={() => setForm({ place: null })}>Add Place</Button>
      </PageHeader>

      {trip.places.length === 0 ? (
        <EmptyState icon={MapPin} title="Start building your travel wishlist." text="Save restaurants, attractions, photo spots, and more." action={<Button icon={Plus} onClick={() => setForm({ place: null })}>Add Place</Button>} />
      ) : (
        <>
          <div className="chips" role="group" aria-label="Filter places by category">
            {['All', ...PLACE_CATEGORIES.map((c) => c.id)].map((c) => {
              const Icon = PLACE_CATEGORIES.find((x) => x.id === c)?.icon;
              return (
                <button key={c} type="button" className={`chip ${cat === c ? 'active' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {Icon && <Icon size={14} aria-hidden="true" />}{c}
                </button>
              );
            })}
          </div>
          <div className="chips" role="group" aria-label="Filter places by status">
            {[['all', 'All places'], ['want', 'Want to visit'], ['visited', 'Visited']].map(([v, l]) => (
              <button key={v} type="button" className={`chip chip-soft ${status === v ? 'active' : ''}`} aria-pressed={status === v} onClick={() => setStatus(v)}>{l}</button>
            ))}
          </div>
          {list.length === 0 ? (
            <p className="muted">No places match these filters.</p>
          ) : (
            <div className="card-grid">
              {list.map((p) => (
                <PlaceCard key={p.id} place={p} onToggle={() => { upsert('places', { ...p, visited: !p.visited }); toast(p.visited ? 'Moved back to want to visit' : 'Marked as visited'); }} onEdit={() => setForm({ place: p })} onDelete={() => setDel(p)} />
              ))}
            </div>
          )}
        </>
      )}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.place ? 'Edit place' : 'Add place'} size="md">
        {form && <PlaceForm key={form.place?.id || 'new'} initial={form.place} defaultCategory={cat === 'All' ? 'Attractions' : cat} onSubmit={save} onCancel={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete this place?" message={del ? `“${del.name}” will be removed from your wishlist.` : ''} confirmLabel="Delete place" danger onConfirm={() => { remove('places', del.id); setDel(null); toast('Place deleted'); }} />
    </div>
  );
}
