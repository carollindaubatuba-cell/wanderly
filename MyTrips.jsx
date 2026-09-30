import { useState } from 'react';
import { Plus, Compass, RotateCcw } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { TripCard } from '../components/cards.jsx';
import { Button, EmptyState, ConfirmDialog } from '../components/ui.jsx';

export default function MyTrips() {
  const { trips, openTrip, openTripModal, duplicateTrip, deleteTrip, toast, demoExists, resetDemo, openDemo } = useStore();
  const [del, setDel] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = trips.filter((t) => t.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = trips.filter((t) => t.endDate < today).sort((a, b) => b.startDate.localeCompare(a.startDate));
  const sorted = [...upcoming, ...past];

  const dup = (t) => {
    const copy = duplicateTrip(t.id);
    if (copy) toast('Trip duplicated');
  };

  return (
    <div className="page">
      <PageHeader title="My Trips" subtitle="All your adventures in one place.">
        {demoExists && <Button variant="secondary" icon={RotateCcw} onClick={() => setResetOpen(true)}>Reset demo</Button>}
        <Button icon={Plus} onClick={() => openTripModal()}>New Trip</Button>
      </PageHeader>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Your next adventure starts here."
          text="Create your first trip to begin planning."
          action={<div className="btn-row"><Button icon={Plus} onClick={() => openTripModal()}>Create your first trip</Button><Button variant="secondary" onClick={openDemo}>Explore demo trip</Button></div>}
        />
      ) : (
        <div className="trip-grid">
          {sorted.map((t) => (
            <TripCard key={t.id} trip={t} onOpen={() => openTrip(t.id)} onEdit={() => openTripModal(t)} onDuplicate={() => dup(t)} onDelete={() => setDel(t)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete this trip?"
        message={del ? `“${del.name}” and everything in it (itinerary, bookings, budget, packing list, places and notes) will be permanently deleted from this device.` : ''}
        confirmLabel="Delete trip"
        danger
        onConfirm={() => { deleteTrip(del.id); setDel(null); toast('Trip deleted'); }}
      />
      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset the demo trip?"
        message="The Amalfi Coast demo will be replaced with a fresh copy. Your own trips are not touched."
        confirmLabel="Reset demo"
        onConfirm={() => { resetDemo(); setResetOpen(false); }}
      />
    </div>
  );
}
