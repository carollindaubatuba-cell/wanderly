import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { PageHeader } from '../components/Page.jsx';
import { BudgetCard } from '../components/cards.jsx';
import { BudgetCategoryForm } from '../components/forms.jsx';
import { Button, Card, Modal, ConfirmDialog, MoneyField, ProgressBar } from '../components/ui.jsx';
import { budgetTotals, activitiesCost } from '../utils/calc.js';
import { money, currencySymbol } from '../utils/format.js';
import { uid } from '../utils/ids.js';

export default function Budget() {
  const { trip, upsert, remove, updateTrip, toast } = useStore();
  const t = budgetTotals(trip);
  const cur = trip.currency;
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);
  const [totalOpen, setTotalOpen] = useState(false);

  const change = (c, patch) => { upsert('budgetCategories', { ...c, ...patch }); };
  const save = (values) => {
    if (form.category) { upsert('budgetCategories', { ...form.category, ...values }); toast('Category updated'); }
    else { upsert('budgetCategories', { id: uid(), custom: true, ...values }); toast('Category added'); }
    setForm(null);
  };
  const est = activitiesCost(trip);

  return (
    <div className="page">
      <PageHeader title="Trip Budget" tripName={trip.name}>
        <Button variant="secondary" icon={Pencil} onClick={() => setTotalOpen(true)}>Edit total</Button>
        <Button icon={Plus} onClick={() => setForm({ category: null })}>Add category</Button>
      </PageHeader>

      <Card className="budget-summary">
        <dl className="budget-stats">
          <div><dt>Total budget</dt><dd>{money(t.total, cur)}</dd></div>
          <div><dt>Planned</dt><dd>{money(t.planned, cur)}</dd></div>
          <div><dt>Actual</dt><dd>{money(t.actual, cur)}</dd></div>
          <div className={t.over ? 'is-over' : ''}><dt>{t.over ? 'Over budget' : 'Remaining'}</dt><dd>{money(Math.abs(t.remaining), cur)}</dd></div>
        </dl>
        <div className="budget-meter">
          <div className="meter-labels">
            <span>{Math.round(t.pctUsed)}% of budget spent</span>
            <span>{Math.round(t.pctPlanned)}% planned</span>
          </div>
          <div className="meter" role="img" aria-label={`${Math.round(t.pctUsed)} percent of the budget spent, ${Math.round(t.pctPlanned)} percent planned`}>
            <span className="meter-planned" style={{ width: `${t.pctPlanned}%` }} />
            <span className={`meter-actual ${t.over ? 'over' : ''}`} style={{ width: `${t.pctUsed}%` }} />
          </div>
          <div className="meter-legend">
            <span><i className="lg lg-actual" />Actual</span>
            <span><i className="lg lg-planned" />Planned</span>
          </div>
          {t.over && <p className="over-note">You are over budget by {money(-t.remaining, cur)}.</p>}
        </div>
        <div className="per-traveler">
          <h3>Cost per traveler</h3>
          <p><strong>{money(t.perTravelerActual, cur)}</strong> spent so far · <strong>{money(t.perTravelerPlanned, cur)}</strong> planned · {trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</p>
        </div>
      </Card>

      <div className="budget-list">
        {trip.budgetCategories.map((c) => (
          <BudgetCard key={c.id} category={c} currency={cur} MoneyField={MoneyField} onChange={(p) => change(c, p)} onEdit={() => setForm({ category: c })} onDelete={() => setDel(c)} />
        ))}
      </div>
      {est > 0 && <p className="muted budget-foot">Your itinerary adds up to {money(est, cur)} in estimated activity costs. <a className="link-quiet" href="#/itinerary">View itinerary</a></p>}

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.category ? 'Edit category' : 'Add budget category'} size="sm">
        {form && <BudgetCategoryForm key={form.category?.id || 'new'} initial={form.category} onSubmit={save} onCancel={() => setForm(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="Delete this category?" message={del ? `“${del.name}” and its amounts will be removed from your budget.` : ''} confirmLabel="Delete category" danger onConfirm={() => { remove('budgetCategories', del.id); setDel(null); toast('Category deleted'); }} />
      <TotalModal open={totalOpen} onClose={() => setTotalOpen(false)} trip={trip} onSave={(v) => { updateTrip(trip.id, { budget: v }); toast('Budget updated'); setTotalOpen(false); }} />
    </div>
  );
}

function TotalModal({ open, onClose, trip, onSave }) {
  const [v, setV] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const n = Number(String(v).replace(/,/g, ''));
    if (String(v).trim() === '' || !Number.isFinite(n) || n < 0) { setErr('Enter a valid budget (0 or more).'); return; }
    setErr('');
    onSave(Math.round(n * 100) / 100);
  };
  return (
    <Modal open={open} onClose={onClose} title="Edit total budget" size="sm">
      {open && (
        <form onSubmit={submit} noValidate className="form-grid">
          <div className="span-2">
            <label className="field-label" htmlFor="total-budget">Total budget ({currencySymbol(trip.currency)})</label>
            <input id="total-budget" className={`input ${err ? 'input-error' : ''}`} type="number" inputMode="decimal" min="0" step="any" defaultValue={trip.budget} onChange={(e) => setV(e.target.value)} onFocus={() => setV((p) => p || String(trip.budget))} aria-invalid={err ? 'true' : undefined} data-autofocus />
            {err && <p className="field-error" role="alert">{err}</p>}
          </div>
          <div className="form-actions span-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save budget</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
