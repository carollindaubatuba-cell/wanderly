import { useState } from 'react';
import { Plus, NotebookPen } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { NoteCard } from '../components/cards.jsx';
import { Button, EmptyState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { uid, nowISO } from '../utils/ids.js';

export default function Notes() {
  const { trip, upsert, remove, toast } = useStore();
  const [editor, setEditor] = useState(null); // { note|null }
  const [del, setDel] = useState(null);
  const sorted = [...trip.notes].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

  return (
    <div className="page">
      <PageHeader title="Travel Notes" tripName={trip.name}>
        <Button icon={Plus} onClick={() => setEditor({ note: null })}>New Note</Button>
      </PageHeader>

      {sorted.length === 0 ? (
        <EmptyState icon={NotebookPen} title="Nothing to remember yet." text="Capture ideas and travel notes here." action={<Button icon={Plus} onClick={() => setEditor({ note: null })}>New Note</Button>} />
      ) : (
        <div className="card-grid">
          {sorted.map((n) => <NoteCard key={n.id} note={n} onOpen={() => setEditor({ note: n })} onDelete={() => setDel(n)} />)}
        </div>
      )}

      <NoteEditor
        open={!!editor}
        note={editor?.note}
        onClose={() => setEditor(null)}
        onSave={(title, content) => {
          const now = nowISO();
          if (editor.note) { upsert('notes', { ...editor.note, title, content, updatedAt: now }); toast('Note updated'); }
          else { upsert('notes', { id: uid(), title, content, createdAt: now, updatedAt: now }); toast('Note added'); }
          setEditor(null);
        }}
      />
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete this note?" message={del ? `“${del.title}” will be permanently deleted.` : ''} confirmLabel="Delete note" danger onConfirm={() => { remove('notes', del.id); setDel(null); toast('Note deleted'); }} />
    </div>
  );
}

function NoteEditor({ open, note, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [err, setErr] = useState('');
  const [seed, setSeed] = useState(null);
  // reset fields whenever a different note (or a new one) is opened
  if (open && seed !== (note?.id || 'new')) {
    setSeed(note?.id || 'new');
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setErr('');
  }
  if (!open && seed !== null) setSeed(null);
  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) { setErr('Add a title or some text first.'); return; }
    onSave(title.trim() || 'Untitled note', content);
  };
  return (
    <Modal open={open} onClose={onClose} title={note ? 'Edit note' : 'New note'} size="lg">
      <form onSubmit={submit} noValidate className="note-editor">
        <label className="sr-only" htmlFor="note-title">Note title</label>
        <input id="note-title" className="note-title-input" placeholder="Title" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} data-autofocus />
        <label className="sr-only" htmlFor="note-body">Note text</label>
        <textarea id="note-body" className="note-body-input" placeholder="Start writing…" value={content} maxLength={20000} onChange={(e) => setContent(e.target.value)} rows={12} />
        {err && <p className="field-error" role="alert">{err}</p>}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save note</Button>
        </div>
      </form>
    </Modal>
  );
}
