import { useState } from 'react';
import { Plus, Backpack, Trash2, RotateCcw } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { PackingItem } from '../components/cards.jsx';
import { Button, Card, EmptyState, IconButton, Modal, ConfirmDialog, Input, ProgressBar } from '../components/ui.jsx';
import { packingProgress } from '../utils/calc.js';
import { uid } from '../utils/ids.js';

function AddItem({ onAdd, label }) {
  const [v, setV] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const t = v.trim();
    if (!t) return;
    onAdd(t);
    setV('');
  };
  return (
    <form className="add-item" onSubmit={submit}>
      <input className="input" aria-label={label} placeholder="Add an item" value={v} maxLength={100} onChange={(e) => setV(e.target.value)} />
      <Button type="submit" variant="secondary" size="sm" icon={Plus} aria-label={label}>Add</Button>
    </form>
  );
}

export default function Packing() {
  const { trip, patchTrip, toast } = useStore();
  const p = packingProgress(trip);
  const [catOpen, setCatOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catErr, setCatErr] = useState('');
  const [delCat, setDelCat] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);

  const setCats = (fn) => patchTrip((t) => ({ packingCategories: fn(t.packingCategories) }));
  const mapCat = (id, fn) => setCats((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));

  const toggle = (cid, iid) => mapCat(cid, (c) => ({ ...c, items: c.items.map((i) => (i.id === iid ? { ...i, packed: !i.packed } : i)) }));
  const addCat = (e) => {
    e.preventDefault();
    if (!catName.trim()) { setCatErr('Please enter a category name.'); return; }
    setCats((cs) => [...cs, { id: uid(), name: catName.trim(), items: [] }]);
    toast('Category added');
    setCatName(''); setCatErr(''); setCatOpen(false);
  };

  return (
    <div className="page">
      <PageHeader title="Packing List" tripName={trip.name}>
        <Button variant="secondary" icon={RotateCcw} onClick={() => setResetOpen(true)} disabled={!p.packed}>Uncheck all</Button>
        <Button icon={Plus} onClick={() => setCatOpen(true)}>Add category</Button>
      </PageHeader>

      <Card className="pack-summary">
        <div className="pack-summary-head">
          <p className="pack-count"><strong>{p.packed} / {p.total}</strong> packed</p>
          <span className="pack-pct">{Math.round(p.pct)}%</span>
        </div>
        <ProgressBar value={p.pct} size="lg" label="Packing progress" />
      </Card>

      {trip.packingCategories.length === 0 ? (
        <EmptyState icon={Backpack} title="Nothing to pack yet." text="Add a category to start your list." action={<Button icon={Plus} onClick={() => setCatOpen(true)}>Add category</Button>} />
      ) : (
        <div className="pack-grid">
          {trip.packingCategories.map((c) => {
            const done = c.items.filter((i) => i.packed).length;
            return (
              <Card key={c.id} className="pack-cat">
                <div className="pack-cat-head">
                  <h2 className="pack-cat-title">{c.name}</h2>
                  <span className="pack-cat-count">{done}/{c.items.length}</span>
                  <IconButton icon={Trash2} label={`Delete category ${c.name}`} onClick={() => setDelCat(c)} />
                </div>
                <ul className="pack-list">
                  {c.items.map((i) => (
                    <PackingItem
                      key={i.id}
                      item={i}
                      onToggle={() => toggle(c.id, i.id)}
                      onRename={(name) => { mapCat(c.id, (x) => ({ ...x, items: x.items.map((it) => (it.id === i.id ? { ...it, name } : it)) })); toast('Packing item updated'); }}
                      onDelete={() => { mapCat(c.id, (x) => ({ ...x, items: x.items.filter((it) => it.id !== i.id) })); toast('Packing item deleted'); }}
                    />
                  ))}
                </ul>
                <AddItem label={`Add an item to ${c.name}`} onAdd={(name) => { mapCat(c.id, (x) => ({ ...x, items: [...x.items, { id: uid(), name, packed: false }] })); toast('Packing item added'); }} />
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={catOpen} onClose={() => { setCatOpen(false); setCatErr(''); }} title="Add packing category" size="sm">
        <form onSubmit={addCat} noValidate className="form-grid">
          <Input wrapClass="span-2" label="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} error={catErr} placeholder="Beach gear" maxLength={60} data-autofocus />
          <div className="form-actions span-2">
            <Button variant="secondary" onClick={() => setCatOpen(false)}>Cancel</Button>
            <Button type="submit">Add category</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!delCat} onClose={() => setDelCat(null)} title="Delete this category?" message={delCat ? `“${delCat.name}” and its ${delCat.items.length} ${delCat.items.length === 1 ? 'item' : 'items'} will be removed.` : ''} confirmLabel="Delete category" danger onConfirm={() => { setCats((cs) => cs.filter((c) => c.id !== delCat.id)); setDelCat(null); toast('Category deleted'); }} />
      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} title="Uncheck every item?" message="Your items stay on the list. They will all be marked as not packed." confirmLabel="Uncheck all" onConfirm={() => { setCats((cs) => cs.map((c) => ({ ...c, items: c.items.map((i) => ({ ...i, packed: false })) }))); setResetOpen(false); toast('Packing list reset'); }} />
    </div>
  );
}
