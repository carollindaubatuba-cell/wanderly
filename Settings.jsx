import { useRef, useState } from 'react';
import { Sun, Moon, Download, Upload, Trash2, RotateCcw, Lock, Save } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { Button, Card, Segmented, Select, Switch, Modal, Input } from '../components/ui.jsx';
import { CURRENCIES } from '../data/constants.js';

function Section({ title, description, children }) {
  return (
    <Card className="settings-card">
      <h2 className="card-title">{title}</h2>
      {description && <p className="muted settings-desc">{description}</p>}
      {children}
    </Card>
  );
}

export default function Settings() {
  const { settings, setSettings, trip, trips, exportTrip, exportAll, importText, demoExists, resetDemo, clearAll, toast, dirty, saveNow, navigate } = useStore();
  const fileRef = useRef(null);
  const [importMsg, setImportMsg] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [typed, setTyped] = useState('');

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportMsg(null);
    try {
      const text = await file.text();
      const res = importText(text, file.size);
      if (res.ok) {
        setImportMsg({ ok: true, text: `Imported ${res.count} ${res.count === 1 ? 'trip' : 'trips'}.` });
        toast(`Imported ${res.count} ${res.count === 1 ? 'trip' : 'trips'}`);
      } else {
        setImportMsg({ ok: false, text: res.error });
      }
    } catch {
      setImportMsg({ ok: false, text: 'That file could not be read.' });
    }
  };

  return (
    <div className="page page-narrow">
      <PageHeader title="Settings" subtitle="Make Wanderly feel like yours." />

      <Section title="Appearance">
        <Segmented label="Theme" value={settings.theme} onChange={(v) => setSettings({ theme: v })} options={[{ value: 'light', label: 'Light mode', icon: Sun }, { value: 'dark', label: 'Dark mode', icon: Moon }]} />
      </Section>

      <Section title="Currency" description="Used for new trips. Each trip keeps its own currency, which you can change in Trip Settings.">
        <Select label="Default currency" value={settings.currency} onChange={(e) => setSettings({ currency: e.target.value })} options={CURRENCIES} />
      </Section>

      <Section title="Preferences">
        <Switch checked={settings.weekStartsMonday} onChange={(v) => setSettings({ weekStartsMonday: v })} label="Start week on Monday" description="Applies to the calendar on your overview." />
        <Switch checked={settings.showCountdown} onChange={(v) => setSettings({ showCountdown: v })} label="Show countdown" description="Days-to-go labels on trips and the sidebar." />
        <Switch checked={settings.autoSave} onChange={(v) => setSettings({ autoSave: v })} label="Automatically save changes" description="Keep this on so nothing is lost. If you turn it off, use Save now to store changes." />
        {!settings.autoSave && (
          <Button variant="secondary" icon={Save} onClick={saveNow} disabled={!dirty}>Save now</Button>
        )}
      </Section>

      <Section title="Data" description="Back up your planner or move it to another device.">
        <p className="privacy-inline"><Lock size={15} aria-hidden="true" />Your planner information is stored locally in your browser and is not sent to a Wanderly server.</p>
        <div className="data-actions">
          <Button variant="secondary" icon={Download} disabled={!trip} onClick={() => { exportTrip(trip.id) ? toast('Trip exported') : toast('Export is not available in this browser.', 'error'); }}>Export trip</Button>
          <Button variant="secondary" icon={Download} disabled={!trips.length} onClick={() => { exportAll() ? toast('Backup exported') : toast('Export is not available in this browser.', 'error'); }}>Export all trips</Button>
          <Button variant="secondary" icon={Upload} onClick={() => fileRef.current?.click()}>Import trip</Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-label="Choose a Wanderly JSON file to import" onChange={onFile} />
        </div>
        {trip && <p className="muted small">Export trip saves “{trip.name}”. Imports are added as new trips and never overwrite existing ones.</p>}
        {importMsg && <p className={`import-msg ${importMsg.ok ? 'ok' : 'bad'}`} role={importMsg.ok ? 'status' : 'alert'}>{importMsg.text}{importMsg.ok && <> <button type="button" className="link-btn" onClick={() => navigate('trips')}>View trips</button></>}</p>}
        <hr className="divider" />
        <div className="data-actions">
          {demoExists && <Button variant="secondary" icon={RotateCcw} onClick={() => setResetOpen(true)}>Reset demo</Button>}
          <Button variant="danger-outline" icon={Trash2} disabled={!trips.length} onClick={() => { setTyped(''); setClearOpen(true); }}>Clear all data</Button>
        </div>
      </Section>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset the demo trip?" size="sm" footer={<><Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button><Button onClick={() => { resetDemo(); setResetOpen(false); }}>Reset demo</Button></>}>
        <p className="confirm-text">The Amalfi Coast demo will be replaced with a fresh copy. Your own trips are not touched.</p>
      </Modal>
      <Modal open={clearOpen} onClose={() => setClearOpen(false)} title="Clear all data?" size="sm" footer={<><Button variant="secondary" onClick={() => setClearOpen(false)}>Cancel</Button><Button variant="danger" disabled={typed.trim().toUpperCase() !== 'DELETE'} onClick={() => { clearAll(); setClearOpen(false); toast('All trips deleted'); }}>Delete everything</Button></>}>
        <p className="confirm-text">Every trip, itinerary, booking, budget, packing list, place and note on this device will be permanently deleted. Your theme and preferences are kept. Export a backup first if you might want this data again.</p>
        <Input label="Type DELETE to confirm" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
      </Modal>
    </div>
  );
}
