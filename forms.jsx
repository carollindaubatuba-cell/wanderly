import { useRef, useState } from 'react';
import { Button, Input, Select, Textarea, DatePicker, Switch } from './ui.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { CURRENCIES, ACTIVITY_CATEGORIES, BOOKING_TYPES, PLACE_CATEGORIES, DOC_TYPES } from '../data/constants.js';
import { validateTrip, validateActivity, validateBooking, parseAmount } from '../utils/validate.js';
import { tripDays } from '../utils/calc.js';
import { parseISO, addDays, formatShort, toISO } from '../utils/dates.js';
import { plural } from '../utils/format.js';

const useForm = (initial) => {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const ref = useRef(null);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const fail = (er) => {
    setErrors(er);
    requestAnimationFrame(() => ref.current?.querySelector('[aria-invalid="true"]')?.focus());
  };
  return { f, setF, errors, setErrors, ref, set, fail };
};

/* ---------------- Trip ---------------- */
export function TripForm({ initial, onSubmit, onCancel, submitLabel = 'Save trip', id = 'trip-form', hideActions = false }) {
  const { settings } = useStore();
  const { f, errors, ref, set, fail, setErrors } = useForm({
    name: initial?.name ?? '',
    destination: initial?.destination ?? '',
    country: initial?.country ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    travelers: String(initial?.travelers ?? 2),
    budget: initial ? String(initial.budget ?? '') : '',
    currency: initial?.currency ?? settings.currency,
    description: initial?.description ?? '',
    coverImage: initial?.coverImage ?? '',
  });
  const submit = (e) => {
    e.preventDefault();
    const { errors: er, values } = validateTrip(f);
    if (Object.keys(er).length) return fail(er);
    setErrors({});
    onSubmit(values);
  };
  const preview = tripDays({ startDate: f.startDate, endDate: f.endDate });
  return (
    <form id={id} ref={ref} onSubmit={submit} noValidate className="form-grid">
      <Input wrapClass="span-2" label="Trip name" value={f.name} onChange={set('name')} error={errors.name} placeholder="New York City" maxLength={120} data-autofocus />
      <Input label="Destination" value={f.destination} onChange={set('destination')} error={errors.destination} placeholder="New York" maxLength={120} />
      <Input label="Country" value={f.country} onChange={set('country')} placeholder="United States" maxLength={120} />
      <DatePicker label="Start date" value={f.startDate} onChange={set('startDate')} error={errors.startDate} />
      <DatePicker label="End date" value={f.endDate} onChange={set('endDate')} error={errors.endDate} min={f.startDate || undefined}
        hint={preview ? `${plural(preview, 'day')} · ${plural(preview - 1, 'night')}` : undefined} />
      <Input label="Travelers" type="number" inputMode="numeric" min="1" max="99" value={f.travelers} onChange={set('travelers')} error={errors.travelers} />
      <Input label="Budget" type="number" inputMode="decimal" min="0" step="any" value={f.budget} onChange={set('budget')} error={errors.budget} placeholder="1700" />
      <Select wrapClass="span-2" label="Currency" value={f.currency} onChange={set('currency')} options={CURRENCIES} />
      <Textarea wrapClass="span-2" label="Trip description" value={f.description} onChange={set('description')} placeholder="Weekend trip with friends." maxLength={2000} />
      <Input wrapClass="span-2" label="Cover image URL (optional)" value={f.coverImage} onChange={set('coverImage')} error={errors.coverImage} placeholder="https://…" hint="Leave blank for an elegant gradient cover." />
      {!hideActions && (
        <div className="form-actions span-2">
          {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
          <Button type="submit">{submitLabel}</Button>
        </div>
      )}
    </form>
  );
}

/* ---------------- Activity ---------------- */
export function ActivityForm({ trip, initial, dayIndex = 0, onSubmit, onCancel }) {
  const days = tripDays(trip);
  const start = parseISO(trip.startDate);
  const { f, errors, ref, set, fail, setErrors } = useForm({
    dayIndex: String(initial?.dayIndex ?? dayIndex),
    time: initial?.time ?? '',
    title: initial?.title ?? '',
    category: initial?.category ?? 'Activity',
    location: initial?.location ?? '',
    cost: initial?.cost ? String(initial.cost) : '',
    reservation: initial?.reservation ?? '',
    notes: initial?.notes ?? '',
  });
  const dayOptions = Array.from({ length: days }, (_, i) => ({
    value: String(i),
    label: `Day ${i + 1} · ${formatShort(toISO(addDays(start, i)))}`,
  }));
  const submit = (e) => {
    e.preventDefault();
    const { errors: er, values } = validateActivity(f, days - 1);
    if (Object.keys(er).length) return fail(er);
    setErrors({});
    onSubmit(values);
  };
  return (
    <form id="activity-form" ref={ref} onSubmit={submit} noValidate className="form-grid">
      <Input wrapClass="span-2" label="Title" value={f.title} onChange={set('title')} error={errors.title} placeholder="Lunch at Trattoria" maxLength={160} data-autofocus />
      <Select label="Day" value={f.dayIndex} onChange={set('dayIndex')} options={dayOptions} error={errors.dayIndex} />
      <Input label="Time" type="time" value={f.time} onChange={set('time')} error={errors.time} />
      <Select label="Category" value={f.category} onChange={set('category')} options={ACTIVITY_CATEGORIES.map((c) => c.id)} />
      <Input label="Cost" type="number" inputMode="decimal" min="0" step="any" value={f.cost} onChange={set('cost')} error={errors.cost} placeholder="0" />
      <Input wrapClass="span-2" label="Location" value={f.location} onChange={set('location')} maxLength={200} />
      <Input wrapClass="span-2" label="Reservation (optional)" value={f.reservation} onChange={set('reservation')} placeholder="Table for 2, confirmation code…" maxLength={200} />
      <Textarea wrapClass="span-2" label="Notes" value={f.notes} onChange={set('notes')} maxLength={2000} />
      <div className="form-actions span-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Save activity' : 'Add activity'}</Button>
      </div>
    </form>
  );
}

/* ---------------- Booking ---------------- */
export function BookingForm({ initial, onSubmit, onCancel }) {
  const { f, errors, ref, set, fail, setErrors } = useForm({
    type: initial?.type ?? 'Flight',
    name: initial?.name ?? '',
    date: initial?.date ?? '',
    endDate: initial?.endDate ?? '',
    time: initial?.time ?? '',
    location: initial?.location ?? '',
    provider: initial?.provider ?? '',
    confirmation: initial?.confirmation ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    website: initial?.website ?? '',
    cost: initial?.cost ? String(initial.cost) : '',
    notes: initial?.notes ?? '',
  });
  const submit = (e) => {
    e.preventDefault();
    const { errors: er, values } = validateBooking(f);
    if (Object.keys(er).length) return fail(er);
    setErrors({});
    onSubmit(values);
  };
  return (
    <form id="booking-form" ref={ref} onSubmit={submit} noValidate className="form-grid">
      <Select label="Type" value={f.type} onChange={set('type')} options={BOOKING_TYPES.map((t) => t.id)} />
      <Input label="Booking name" value={f.name} onChange={set('name')} error={errors.name} placeholder="Grand Hotel" maxLength={160} data-autofocus />
      <DatePicker label="Date" value={f.date} onChange={set('date')} error={errors.date} />
      <DatePicker label="End date (optional)" value={f.endDate} onChange={set('endDate')} error={errors.endDate} min={f.date || undefined} />
      <Input label="Time" type="time" value={f.time} onChange={set('time')} error={errors.time} />
      <Input label="Cost" type="number" inputMode="decimal" min="0" step="any" value={f.cost} onChange={set('cost')} error={errors.cost} placeholder="0" />
      <Input wrapClass="span-2" label="Location" value={f.location} onChange={set('location')} maxLength={200} />
      <Input label="Provider" value={f.provider} onChange={set('provider')} maxLength={160} />
      <Input label="Confirmation number" value={f.confirmation} onChange={set('confirmation')} placeholder="ABC12345" maxLength={120} />
      <Input wrapClass="span-2" label="Address" value={f.address} onChange={set('address')} maxLength={300} />
      <Input label="Phone" type="tel" value={f.phone} onChange={set('phone')} maxLength={60} />
      <Input label="Website" value={f.website} onChange={set('website')} error={errors.website} placeholder="example.com" maxLength={500} />
      <Textarea wrapClass="span-2" label="Notes" value={f.notes} onChange={set('notes')} maxLength={2000} />
      <div className="form-actions span-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Save booking' : 'Add booking'}</Button>
      </div>
    </form>
  );
}

/* ---------------- Place ---------------- */
export function PlaceForm({ initial, onSubmit, onCancel, defaultCategory = 'Attractions' }) {
  const { f, setF, errors, ref, set, fail, setErrors } = useForm({
    name: initial?.name ?? '',
    category: initial?.category ?? defaultCategory,
    location: initial?.location ?? '',
    cost: initial?.cost ?? '',
    notes: initial?.notes ?? '',
    visited: initial?.visited ?? false,
  });
  const submit = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return fail({ name: 'Please enter a place name.' });
    setErrors({});
    onSubmit({ name: f.name.trim(), category: f.category, location: f.location.trim(), cost: f.cost.trim(), notes: f.notes.trim(), visited: f.visited });
  };
  return (
    <form id="place-form" ref={ref} onSubmit={submit} noValidate className="form-grid">
      <Input wrapClass="span-2" label="Place name" value={f.name} onChange={set('name')} error={errors.name} placeholder="Central Park" maxLength={160} data-autofocus />
      <Select label="Category" value={f.category} onChange={set('category')} options={PLACE_CATEGORIES.map((c) => c.id)} />
      <Input label="Estimated cost" value={f.cost} onChange={set('cost')} placeholder="Free, $25…" maxLength={60} />
      <Input wrapClass="span-2" label="Location" value={f.location} onChange={set('location')} placeholder="New York, NY" maxLength={200} />
      <Textarea wrapClass="span-2" label="Notes" value={f.notes} onChange={set('notes')} maxLength={2000} />
      <div className="span-2">
        <Switch checked={f.visited} onChange={(v) => setF((p) => ({ ...p, visited: v }))} label="Already visited" />
      </div>
      <div className="form-actions span-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Save place' : 'Add place'}</Button>
      </div>
    </form>
  );
}

/* ---------------- Budget category ---------------- */
export function BudgetCategoryForm({ initial, onSubmit, onCancel }) {
  const { f, errors, ref, set, fail, setErrors } = useForm({
    name: initial?.name ?? '',
    planned: initial?.planned ? String(initial.planned) : '',
    actual: initial?.actual ? String(initial.actual) : '',
  });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Please enter a category name.';
    const p = parseAmount(f.planned);
    const a = parseAmount(f.actual);
    if (!p.ok) er.planned = 'Enter a valid amount.';
    if (!a.ok) er.actual = 'Enter a valid amount.';
    if (Object.keys(er).length) return fail(er);
    setErrors({});
    onSubmit({ name: f.name.trim(), planned: p.value, actual: a.value });
  };
  return (
    <form id="budget-cat-form" ref={ref} onSubmit={submit} noValidate className="form-grid">
      <Input wrapClass="span-2" label="Category name" value={f.name} onChange={set('name')} error={errors.name} placeholder="Souvenirs" maxLength={60} data-autofocus />
      <Input label="Planned" type="number" inputMode="decimal" min="0" step="any" value={f.planned} onChange={set('planned')} error={errors.planned} placeholder="0" />
      <Input label="Actual" type="number" inputMode="decimal" min="0" step="any" value={f.actual} onChange={set('actual')} error={errors.actual} placeholder="0" />
      <div className="form-actions span-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Save category' : 'Add category'}</Button>
      </div>
    </form>
  );
}

/* ---------------- Travel document ---------------- */
export function DocumentForm({ initial, onSubmit, onCancel }) {
  const { f, errors, ref, set, fail, setErrors } = useForm({
    type: initial?.type ?? 'Passport',
    label: initial?.label ?? '',
    value: initial?.value ?? '',
  });
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.label.trim()) er.label = 'Please enter a label.';
    if (!f.value.trim()) er.value = 'Please enter the details to save.';
    if (Object.keys(er).length) return fail(er);
    setErrors({});
    onSubmit({ type: f.type, label: f.label.trim(), value: f.value.trim() });
  };
  return (
    <form id="document-form" ref={ref} onSubmit={submit} noValidate className="form-grid">
      <Select wrapClass="span-2" label="Type" value={f.type} onChange={set('type')} options={DOC_TYPES.map((t) => t.id)} />
      <Input wrapClass="span-2" label="Label" value={f.label} onChange={set('label')} error={errors.label} placeholder="Passport number" maxLength={120} data-autofocus />
      <Textarea wrapClass="span-2" label="Details" value={f.value} onChange={set('value')} error={errors.value} maxLength={2000} hint="Text only. Nothing is uploaded anywhere." />
      <div className="form-actions span-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? 'Save' : 'Add to documents'}</Button>
      </div>
    </form>
  );
}
