import { CalendarDays, Wallet, Ticket, Backpack, MapPin, NotebookPen, FileText, LifeBuoy, Printer, Pencil, ChevronRight, Settings } from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { TripHero } from '../components/cards.jsx';
import { Button, Card, ProgressBar } from '../components/ui.jsx';
import { tripDays, tripNights, budgetTotals, packingProgress, planningProgress, activitiesCost } from '../utils/calc.js';
import { money, plural } from '../utils/format.js';

function Stat({ value, label }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function DashCard({ href, icon: Icon, title, big, sub, action }) {
  return (
    <a className="card card-interactive dash-card" href={href}>
      <span className="dash-card-icon"><Icon size={19} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p className="dash-card-big">{big}</p>
      {sub && <p className="dash-card-sub">{sub}</p>}
      <span className="dash-card-link">{action}<ChevronRight size={15} aria-hidden="true" /></span>
    </a>
  );
}

export default function TripOverview() {
  const { trip, openTripModal } = useStore();
  const bt = budgetTotals(trip);
  const pk = packingProgress(trip);
  const pr = planningProgress(trip);
  const cur = trip.currency;
  return (
    <div className="page">
      <TripHero trip={trip}>
        <Button variant="light" icon={Printer} onClick={() => window.print()}>Print Trip</Button>
        <Button variant="glass" icon={Pencil} onClick={() => openTripModal(trip)}>Edit trip</Button>
      </TripHero>

      {trip.description && <p className="trip-desc">{trip.description}</p>}

      <Card className="stats-card">
        <dl className="stats">
          <Stat value={tripDays(trip)} label="Days" />
          <Stat value={tripNights(trip)} label="Nights" />
          <Stat value={trip.travelers} label="Travelers" />
          <Stat value={money(trip.budget, cur)} label="Budget" />
        </dl>
      </Card>

      <Card className="progress-card">
        <div className="progress-head">
          <div>
            <h2 className="card-title">Planning progress</h2>
            <p className="muted">How much of your trip is ready.</p>
          </div>
          <span className="progress-pct">{pr.pct}%</span>
        </div>
        <ProgressBar value={pr.pct} size="lg" label="Planning progress" />
        <ul className="progress-parts">
          {pr.parts.map((p) => (
            <li key={p.key}>
              <span className={`part-dot ${p.value >= 1 ? 'full' : p.value > 0 ? 'half' : ''}`} aria-hidden="true" />
              <span className="part-label">{p.label}</span>
              <span className="part-note">{p.value >= 1 ? 'Done · ' : ''}{p.note}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="dash-cards">
        <DashCard href="#/itinerary" icon={CalendarDays} title="Itinerary" big={plural(trip.activities.length, 'activity', 'activities')} sub={activitiesCost(trip) > 0 ? `${money(activitiesCost(trip), cur)} estimated` : undefined} action="View itinerary" />
        <DashCard href="#/budget" icon={Wallet} title="Budget" big={`${money(bt.actual, cur)} / ${money(bt.total, cur)}`} sub={bt.over ? `Over by ${money(-bt.remaining, cur)}` : `${money(bt.remaining, cur)} remaining`} action="Open budget" />
        <DashCard href="#/bookings" icon={Ticket} title="Bookings" big={plural(trip.bookings.length, 'booking')} action="View bookings" />
        <DashCard href="#/packing" icon={Backpack} title="Packing" big={`${pk.packed} / ${pk.total} items packed`} action="Open packing list" />
        <DashCard href="#/places" icon={MapPin} title="Places" big={`${trip.places.length} saved ${trip.places.length === 1 ? 'place' : 'places'}`} action="Explore places" />
        <DashCard href="#/notes" icon={NotebookPen} title="Notes" big={plural(trip.notes.length, 'note')} action="Open notes" />
        <DashCard href="#/documents" icon={FileText} title="Travel documents" big={plural(trip.documents.length, 'saved item')} action="Open documents" />
        <DashCard href="#/emergency" icon={LifeBuoy} title="Emergency info" big={trip.emergencyInfo.localNumber ? `Local number ${trip.emergencyInfo.localNumber}` : 'Not added yet'} action="View emergency info" />
      </div>
      <p className="center-link"><a className="link-quiet" href="#/tripsettings"><Settings size={15} aria-hidden="true" /> Trip settings</a></p>
    </div>
  );
}
