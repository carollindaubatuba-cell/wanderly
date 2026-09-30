import { Plus, Plane, CalendarDays, Wallet, Backpack, Ticket, Check, Lock, Sun, Moon } from 'lucide-react';
import { Button, ProgressBar } from '../components/ui.jsx';
import { useStore } from '../hooks/useStore.jsx';

function Preview({ icon: Icon, title, children }) {
  return (
    <div className="prev-card">
      <div className="prev-head"><Icon size={16} aria-hidden="true" /><h3>{title}</h3></div>
      {children}
    </div>
  );
}

export default function Welcome() {
  const { openTripModal, openDemo, settings, setSettings } = useStore();
  const dark = settings.theme === 'dark';
  return (
    <div className="welcome">
      <header className="welcome-bar">
        <a className="logo" href="#/overview" aria-label="Wanderly home">
          <span className="logo-mark"><Plane size={16} aria-hidden="true" /></span>
          <span className="logo-word">Wanderly</span>
        </a>
        <div className="welcome-bar-actions">
          <a className="link-quiet" href="#/settings">Import a backup</a>
          <button type="button" className="icon-btn icon-btn-ghost" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}>
            {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <section className="welcome-hero">
        <div className="welcome-contours" aria-hidden="true" />
        <p className="welcome-sub-brand">Your trip. Your plans. Your adventure.</p>
        <h1 className="welcome-title">Plan the trip.<br />Remember the moments.</h1>
        <p className="welcome-lede">Organize your itinerary, budget, bookings, packing list, and favorite places — all in one beautiful travel planner.</p>
        <div className="btn-row center">
          <Button size="lg" icon={Plus} onClick={() => openTripModal()}>Create a Trip</Button>
          <Button size="lg" variant="secondary" onClick={openDemo}>Explore Demo</Button>
        </div>
        <p className="welcome-note"><Lock size={14} aria-hidden="true" />No account. No sign-in. Your data stays on your device.</p>
      </section>

      <section className="welcome-preview" aria-label="A look inside Wanderly">
        <Preview icon={CalendarDays} title="Itinerary">
          <ol className="prev-timeline">
            <li><span>09:30 AM</span>Flight arrival</li>
            <li><span>11:00 AM</span>Hotel check-in</li>
            <li><span>01:00 PM</span>Lunch at the trattoria</li>
            <li><span>07:30 PM</span>Dinner with a view</li>
          </ol>
        </Preview>
        <Preview icon={Wallet} title="Budget">
          <p className="prev-big">$1,005 <small>of $1,700</small></p>
          <ProgressBar value={59} label="Example budget progress" />
          <p className="prev-small">$695 remaining · $335 per traveler</p>
        </Preview>
        <Preview icon={Backpack} title="Packing">
          <ul className="prev-checks">
            <li className="done"><Check size={13} aria-hidden="true" />Passport</li>
            <li className="done"><Check size={13} aria-hidden="true" />Charger</li>
            <li><span className="empty-box" aria-hidden="true" />Sunscreen</li>
            <li><span className="empty-box" aria-hidden="true" />Camera</li>
          </ul>
          <p className="prev-small">2 of 4 packed</p>
        </Preview>
        <Preview icon={Ticket} title="Bookings">
          <p className="prev-kicker">Hotel</p>
          <p className="prev-name">Grand Hotel</p>
          <p className="prev-small">Oct 16 – 19 · Confirmation ABC12345</p>
        </Preview>
      </section>

      <section className="welcome-private">
        <h2>Private by design</h2>
        <p>Your planner information is stored locally in your browser and is not sent to a Wanderly server.</p>
      </section>

      <footer className="welcome-foot">
        <strong>Wanderly Travel Planner</strong>
        <span>Your data stays on your device.</span>
      </footer>
    </div>
  );
}
