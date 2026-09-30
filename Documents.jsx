import { useState } from 'react';
import { Plus, FileText, Lock } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { DocumentCard } from '../components/cards.jsx';
import { DocumentForm } from '../components/forms.jsx';
import { Button, EmptyState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { uid } from '../utils/ids.js';

export default function Documents() {
  const { trip, upsert, remove, toast } = useStore();
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard');
    } catch {
      toast('Copy is not available here. Select the text instead.', 'error');
    }
  };
  const save = (values) => {
    if (form.doc) { upsert('documents', { ...form.doc, ...values }); toast('Saved'); }
    else { upsert('documents', { id: uid(), ...values }); toast('Added to documents'); }
    setForm(null);
  };
  return (
    <div className="page">
      <PageHeader title="Travel Documents" tripName={trip.name} subtitle="Passport numbers, confirmations, insurance and important addresses.">
        <Button icon={Plus} onClick={() => setForm({ doc: null })}>Add item</Button>
      </PageHeader>
      <p className="privacy-inline"><Lock size={15} aria-hidden="true" />Your planner data is stored locally on this device. Anyone who can open this browser profile can see it.</p>
      {trip.documents.length === 0 ? (
        <EmptyState icon={FileText} title="Keep the important details handy." text="Save text details like passport numbers, insurance policies and confirmation codes. Nothing is uploaded." action={<Button icon={Plus} onClick={() => setForm({ doc: null })}>Add item</Button>} />
      ) : (
        <div className="card-grid">
          {trip.documents.map((d) => <DocumentCard key={d.id} doc={d} onCopy={copy} onEdit={() => setForm({ doc: d })} onDelete={() => setDel(d)} />)}
        </div>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.doc ? 'Edit document details' : 'Add document details'} size="md">
        {form && <DocumentForm key={form.doc?.id || 'new'} initial={form.doc} onSubmit={save} onCancel={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete this item?" message={del ? `“${del.label}” will be removed from this device.` : ''} confirmLabel="Delete item" danger onConfirm={() => { remove('documents', del.id); setDel(null); toast('Item deleted'); }} />
    </div>
  );
}
