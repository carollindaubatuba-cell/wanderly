import { useState } from 'react';
import { Copy, Trash2, Eraser } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { TripForm } from '../components/forms.jsx';
import { Button, Card, ConfirmDialog } from '../components/ui.jsx';

export default function TripSettings() {
  const { trip, updateTrip, duplicateTrip, deleteTrip, clearTripData, toast, openTrip, navigate } = useStore();
  const [confirm, setConfirm] = useState(null);
  return (
    <div className="page page-narrow">
      <PageHeader title="Trip Settings" tripName={trip.name} />
      <Card className="settings-card">
        <TripForm key={trip.id + trip.updatedAt} initial={trip} submitLabel="Save changes" id="trip-settings-form" onSubmit={(v) => { updateTrip(trip.id, v); toast('Trip saved'); }} />
      </Card>
      <Card className="settings-card">
        <h2 className="card-title">Manage this trip</h2>
        <div className="danger-list">
          <div className="danger-row">
            <div><h3>Duplicate trip</h3><p className="muted">Make a copy of this trip to reuse or tweak.</p></div>
            <Button variant="secondary" icon={Copy} onClick={() => { const c = duplicateTrip(trip.id); if (c) { toast('Trip duplicated'); openTrip(c.id); } }}>Duplicate</Button>
          </div>
          <div className="danger-row">
            <div><h3>Clear trip data</h3><p className="muted">Removes activities, bookings, places, notes, documents and emergency info, and resets the budget and packing list. Trip details stay.</p></div>
            <Button variant="danger-outline" icon={Eraser} onClick={() => setConfirm('clear')}>Clear data</Button>
          </div>
          <div className="danger-row">
            <div><h3>Delete trip</h3><p className="muted">Permanently removes this trip from this device.</p></div>
            <Button variant="danger" icon={Trash2} onClick={() => setConfirm('delete')}>Delete trip</Button>
          </div>
        </div>
      </Card>
      <ConfirmDialog open={confirm === 'clear'} onClose={() => setConfirm(null)} title="Clear all data in this trip?" message={`Everything you added to “${trip.name}” will be removed and the budget and packing list reset. This cannot be undone.`} confirmLabel="Clear trip data" danger onConfirm={() => { clearTripData(trip.id); setConfirm(null); toast('Trip data cleared'); }} />
      <ConfirmDialog open={confirm === 'delete'} onClose={() => setConfirm(null)} title="Delete this trip?" message={`“${trip.name}” will be permanently deleted from this device.`} confirmLabel="Delete trip" danger onConfirm={() => { deleteTrip(trip.id); setConfirm(null); toast('Trip deleted'); navigate('trips'); }} />
    </div>
  );
}
