import { useState } from 'react';
import {
  MapPin, Wallet, Users, Clock, Pencil, Copy, Trash2, Check, Phone, Globe, ExternalLink,
  Eye, EyeOff, Calendar, Hash, Bed,
} from 'lucide-react';
import Cover from './Cover.jsx';
import { Button, IconButton, Card, ProgressBar } from './ui.jsx';
import { useStore } from '../hooks/useStore.jsx';
import { tripDays, tripNights, getCountdown } from '../utils/calc.js';
import { formatRange, formatTime, formatShort, parseISO, addDays, toISO } from '../utils/dates.js';
import { money, plural, currencySymbol } from '../utils/format.js';
import { activityMeta, bookingMeta, placeMeta, budgetIcon, DOC_TYPES } from '../data/constants.js';

/* ---------------- Trip hero (dashboard + overview) ---------------- */
export function TripHero({ trip, children }) {
  const { settings } = useStore();
  const cd = getCountdown(trip);
  const days = tripDays(trip);
  return (
    <Cover trip={trip} className="hero">
      <div className="hero-top">
        {settings.showCountdown && cd && <span className="hero-count">{cd.label}</span>}
      </div>
      <div className="hero-main">
        <h2 className="hero-title">{trip.name}</h2>
        <p className="hero-dates">{formatRange(trip.startDate, trip.endDate)}</p>
        <p className="hero-len">{plural(days, 'day')} • {plural(tripNights(trip), 'night')}</p>
        <ul className="hero-facts">
          {trip.country && <li><MapPin size={16} aria-hidden="true" />{trip.country}</li>}
          <li><Wallet size={16} aria-hidden="true" />{money(trip.budget, trip.currency)} budget</li>
          <li><Users size={16} aria-hidden="true" />{plural(trip.travelers, 'traveler')}</li>
        </ul>
        {children && <div className="hero-actions">{children}</div>}
      </div>
    </Cover>
  );
}

/* ---------------- Trip card (My Trips) ---------------- */
export function TripCard({ trip, onOpen, onEdit, onDuplicate, onDelete }) {
  const { settings } = useStore();
  const cd = getCountdown(trip);
  return (
    <Card className="trip-card">
      <Cover trip={trip} className="trip-card-cover">
        <div className="trip-card-badges">
          {trip.isDemo && <span className="pill pill-light">Demo</span>}
          {settings.showCountdown && cd && <span className="pill pill-light">{cd.label}</span>}
        </div>
        <h3 className="trip-card-title">{trip.name}</h3>
      </Cover>
      <div className="trip-card-body">
        <p className="trip-card-place"><MapPin size={15} aria-hidden="true" />{[trip.destination, trip.country].filter(Boolean).join(', ')}</p>
        <p className="trip-card-dates"><Calendar size={15} aria-hidden="true" />{formatRange(trip.startDate, trip.endDate)} · {plural(tripDays(trip), 'day')}</p>
        <div className="trip-card-meta">
          <span><Users size={15} aria-hidden="true" />{plural(trip.travelers, 'traveler')}</span>
          <span><Wallet size={15} aria-hidden="true" />{money(trip.budget, trip.currency)}</span>
        </div>
        <div className="trip-card-actions">
          <Button size="sm" onClick={onOpen}>Open</Button>
          <IconButton icon={Pencil} label={`Edit ${trip.name}`} onClick={onEdit} />
          <IconButton icon={Copy} label={`Duplicate ${trip.name}`} onClick={onDuplicate} />
          <IconButton icon={Trash2} label={`Delete ${trip.name}`} onClick={onDelete} />
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Activity ---------------- */
export function ActivityCard({ activity: a, currency, days, startDate, onEdit, onDuplicate, onDelete, onMove }) {
  const meta = activityMeta(a.category);
  const Icon = meta.icon;
  const start = parseISO(startDate);
  return (
    <li className="tl-item" style={{ '--c': meta.color }}>
      <div className="tl-time">{a.time ? formatTime(a.time) : <span className="tl-anytime">Any time</span>}</div>
      <div className="tl-rail" aria-hidden="true"><span className="tl-dot"><Icon size={13} /></span></div>
      <div className="tl-card">
        <div className="tl-head">
          <div className="tl-titles">
            <h4 className="tl-title">{a.title}</h4>
            <span className="cat-tag"><Icon size={13} aria-hidden="true" />{meta.id}</span>
          </div>
          {a.cost > 0 && <span className="tl-cost">{money(a.cost, currency)}</span>}
        </div>
        {a.location && <p className="tl-line"><MapPin size={14} aria-hidden="true" />{a.location}</p>}
        {a.reservation && <p className="tl-line"><Check size={14} aria-hidden="true" />Reservation: {a.reservation}</p>}
        {a.notes && <p className="tl-notes">{a.notes}</p>}
        <div className="tl-actions">
          <IconButton icon={Pencil} label={`Edit ${a.title}`} onClick={onEdit} />
          <IconButton icon={Copy} label={`Duplicate ${a.title}`} onClick={onDuplicate} />
          <IconButton icon={Trash2} label={`Delete ${a.title}`} onClick={onDelete} />
          {days > 1 && (
            <select className="move-select" aria-label={`Move ${a.title} to another day`} value="" onChange={(e) => e.target.value !== '' && onMove(Number(e.target.value))}>
              <option value="">Move to…</option>
              {Array.from({ length: days }, (_, i) => i).filter((i) => i !== a.dayIndex).map((i) => (
                <option key={i} value={i}>Day {i + 1} · {formatShort(toISO(addDays(start, i)))}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </li>
  );
}

/* ---------------- Booking ---------------- */
export function BookingCard({ booking: b, currency, onEdit, onDelete }) {
  const meta = bookingMeta(b.type);
  const Icon = meta.icon;
  const dates = b.date ? (b.endDate && b.endDate !== b.date ? `${formatShort(b.date)} – ${formatShort(b.endDate)}` : formatShort(b.date)) : '';
  return (
    <Card className="booking-card">
      <div className="booking-head">
        <span className="booking-icon"><Icon size={18} aria-hidden="true" /></span>
        <span className="cat-tag plain">{meta.id}</span>
        {b.cost > 0 && <span className="booking-cost">{money(b.cost, currency)}</span>}
      </div>
      <h3 className="booking-name">{b.name}</h3>
      <dl className="booking-facts">
        {(dates || b.time) && <div><dt><Clock size={14} aria-hidden="true" /><span className="sr-only">Date and time</span></dt><dd>{[dates, formatTime(b.time)].filter(Boolean).join(' · ')}</dd></div>}
        {b.location && <div><dt><MapPin size={14} aria-hidden="true" /><span className="sr-only">Location</span></dt><dd>{b.location}</dd></div>}
        {b.provider && <div><dt><Bed size={14} aria-hidden="true" /><span className="sr-only">Provider</span></dt><dd>{b.provider}</dd></div>}
        {b.address && <div><dt><MapPin size={14} aria-hidden="true" /><span className="sr-only">Address</span></dt><dd>{b.address}</dd></div>}
        {b.phone && <div><dt><Phone size={14} aria-hidden="true" /><span className="sr-only">Phone</span></dt><dd><a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`}>{b.phone}</a></dd></div>}
        {b.website && <div><dt><Globe size={14} aria-hidden="true" /><span className="sr-only">Website</span></dt><dd><a href={b.website} target="_blank" rel="noopener noreferrer">{b.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}<ExternalLink size={12} aria-hidden="true" /></a></dd></div>}
      </dl>
      {b.confirmation && (
        <div className="confirm-box">
          <span className="confirm-label"><Hash size={13} aria-hidden="true" />Confirmation</span>
          <span className="confirm-code">{b.confirmation}</span>
        </div>
      )}
      {b.notes && <p className="booking-notes">{b.notes}</p>}
      <div className="card-actions">
        <Button variant="secondary" size="sm" icon={Pencil} onClick={onEdit}>Edit</Button>
        <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete}>Delete</Button>
      </div>
    </Card>
  );
}

/* ---------------- Budget category row ---------------- */
export function BudgetCard({ category: c, currency, onChange, onEdit, onDelete, MoneyField }) {
  const Icon = budgetIcon(c.name);
  const sym = currencySymbol(currency);
  const over = c.planned > 0 && c.actual > c.planned;
  return (
    <Card className="budget-row">
      <div className="budget-row-head">
        <span className="budget-icon"><Icon size={18} aria-hidden="true" /></span>
        <h3 className="budget-name">{c.name}</h3>
        {c.custom && (
          <span className="budget-row-actions">
            <IconButton icon={Pencil} label={`Edit ${c.name}`} onClick={onEdit} />
            <IconButton icon={Trash2} label={`Delete ${c.name}`} onClick={onDelete} />
          </span>
        )}
      </div>
      <div className="budget-inputs">
        <MoneyField label="Planned" symbol={sym} value={c.planned} onCommit={(v) => onChange({ planned: v })} />
        <MoneyField label="Actual" symbol={sym} value={c.actual} onCommit={(v) => onChange({ actual: v })} />
      </div>
      <ProgressBar value={c.actual} max={c.planned || 1} tone={over ? 'warn' : 'accent'} size="sm" label={`${c.name} spent versus planned`} />
      <p className={`budget-status ${over ? 'is-over' : ''}`}>
        {c.planned <= 0 && c.actual <= 0
          ? 'Nothing planned yet'
          : over
            ? `Over plan by ${money(c.actual - c.planned, currency)}`
            : `${money(Math.max(0, c.planned - c.actual), currency)} left of ${money(c.planned, currency)}`}
      </p>
    </Card>
  );
}

/* ---------------- Packing item ---------------- */
export function PackingItem({ item, onToggle, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const save = () => {
    const v = draft.trim();
    if (v && v !== item.name) onRename(v);
    else setDraft(item.name);
    setEditing(false);
  };
  return (
    <li className={`pack-item ${item.packed ? 'is-packed' : ''}`}>
      {editing ? (
        <input
          className="input pack-edit"
          aria-label={`Rename ${item.name}`}
          value={draft}
          maxLength={100}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') { setDraft(item.name); setEditing(false); }
          }}
        />
      ) : (
        <label className="pack-label">
          <input type="checkbox" className="pack-check" checked={item.packed} onChange={onToggle} />
          <span className="pack-box" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>
          <span className="pack-name">{item.name}</span>
          {item.packed && <span className="sr-only"> (packed)</span>}
        </label>
      )}
      {!editing && (
        <span className="pack-actions">
          <IconButton icon={Pencil} label={`Rename ${item.name}`} onClick={() => { setDraft(item.name); setEditing(true); }} />
          <IconButton icon={Trash2} label={`Delete ${item.name}`} onClick={onDelete} />
        </span>
      )}
    </li>
  );
}

/* ---------------- Place ---------------- */
export function PlaceCard({ place: p, onToggle, onEdit, onDelete }) {
  const meta = placeMeta(p.category);
  const Icon = meta.icon;
  return (
    <Card className={`place-card ${p.visited ? 'is-visited' : ''}`}>
      <div className="place-head">
        <span className="place-icon"><Icon size={18} aria-hidden="true" /></span>
        <span className="cat-tag plain">{meta.id}</span>
        <span className="place-status">{p.visited ? 'Visited' : 'Want to visit'}</span>
      </div>
      <h3 className="place-name">{p.name}</h3>
      {p.location && <p className="tl-line"><MapPin size={14} aria-hidden="true" />{p.location}</p>}
      {p.cost && <p className="tl-line"><Wallet size={14} aria-hidden="true" />{p.cost}</p>}
      {p.notes && <p className="place-notes">{p.notes}</p>}
      <div className="card-actions">
        <button type="button" className={`visit-toggle ${p.visited ? 'on' : ''}`} aria-pressed={p.visited} onClick={onToggle}>
          <span className="visit-box" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
          {p.visited ? 'Visited' : 'Mark as visited'}
        </button>
        <span className="spacer" />
        <IconButton icon={Pencil} label={`Edit ${p.name}`} onClick={onEdit} />
        <IconButton icon={Trash2} label={`Delete ${p.name}`} onClick={onDelete} />
      </div>
    </Card>
  );
}

/* ---------------- Note ---------------- */
export function NoteCard({ note: n, onOpen, onDelete }) {
  const d = new Date(n.updatedAt);
  const date = isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <Card className="note-card">
      <button type="button" className="note-open" onClick={onOpen} aria-label={`Open note: ${n.title}`}>
        <h3 className="note-title">{n.title}</h3>
        <p className="note-date">{date}</p>
        <p className="note-excerpt">{n.content || 'Empty note'}</p>
      </button>
      <div className="card-actions">
        <Button variant="secondary" size="sm" icon={Pencil} onClick={onOpen}>Edit</Button>
        <Button variant="ghost" size="sm" icon={Trash2} onClick={onDelete}>Delete</Button>
      </div>
    </Card>
  );
}

/* ---------------- Travel document ---------------- */
export function DocumentCard({ doc, onEdit, onDelete, onCopy }) {
  const sensitive = DOC_TYPES.find((t) => t.id === doc.type)?.sensitive;
  const [shown, setShown] = useState(!sensitive);
  return (
    <Card className="doc-card">
      <div className="doc-head">
        <span className="cat-tag plain">{doc.type}</span>
      </div>
      <h3 className="doc-label">{doc.label}</h3>
      <p className={`doc-value ${shown ? '' : 'is-hidden'}`} aria-live="polite">{shown ? doc.value : '••••••••••'}</p>
      <div className="card-actions">
        {sensitive && (
          <Button variant="secondary" size="sm" icon={shown ? EyeOff : Eye} onClick={() => setShown((s) => !s)} aria-pressed={shown}>
            {shown ? 'Hide' : 'Show'}
          </Button>
        )}
        <Button variant="secondary" size="sm" icon={Copy} onClick={() => onCopy(doc.value)}>Copy</Button>
        <span className="spacer" />
        <IconButton icon={Pencil} label={`Edit ${doc.label}`} onClick={onEdit} />
        <IconButton icon={Trash2} label={`Delete ${doc.label}`} onClick={onDelete} />
      </div>
    </Card>
  );
}
