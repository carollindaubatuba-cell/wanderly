import { useState } from 'react';
import { Phone, LifeBuoy } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { Button, Card, Input } from '../components/ui.jsx';
import { EMERGENCY_FIELDS } from '../data/constants.js';

const telHref = (v) => {
  const m = String(v).match(/^\s*\+?[\d\s().-]{3,}\s*$/);
  return m ? `tel:${v.replace(/[^\d+]/g, '')}` : null;
};

export default function Emergency() {
  const { trip, updateTrip, toast } = useStore();
  const [draft, setDraft] = useState(trip.emergencyInfo);
  const dirty = EMERGENCY_FIELDS.some((f) => (draft[f.key] || '') !== (trip.emergencyInfo[f.key] || ''));
  const save = (e) => {
    e.preventDefault();
    updateTrip(trip.id, { emergencyInfo: Object.fromEntries(EMERGENCY_FIELDS.map((f) => [f.key, (draft[f.key] || '').trim()])) });
    toast('Emergency info saved');
  };
  const filled = EMERGENCY_FIELDS.filter((f) => trip.emergencyInfo[f.key]);
  return (
    <div className="page">
      <PageHeader title="Emergency Information" tripName={trip.name} subtitle="Keep the numbers you might need in one place." />
      {filled.some((f) => f.tel && telHref(trip.emergencyInfo[f.key])) && (
        <Card className="emergency-quick">
          <h2 className="card-title">Quick dial</h2>
          <div className="quick-dial">
            {filled.filter((f) => f.tel && telHref(trip.emergencyInfo[f.key])).map((f) => (
              <a key={f.key} className="btn btn-secondary btn-md" href={telHref(trip.emergencyInfo[f.key])}>
                <Phone size={16} aria-hidden="true" />{f.label}: {trip.emergencyInfo[f.key]}
              </a>
            ))}
          </div>
        </Card>
      )}
      <Card className="emergency-form-card">
        <form onSubmit={save} noValidate className="form-grid">
          {EMERGENCY_FIELDS.map((f, i) => (
            <Input key={f.key} wrapClass={i >= 4 ? 'span-2' : ''} label={f.label} value={draft[f.key] || ''} maxLength={300} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} placeholder={f.tel ? 'Number' : 'Name and phone number'} />
          ))}
          <div className="form-actions span-2">
            <Button type="submit" icon={LifeBuoy} disabled={!dirty}>Save emergency info</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
