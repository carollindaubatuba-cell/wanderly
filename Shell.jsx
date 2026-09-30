import { useEffect, useState } from 'react';
import {
  LayoutGrid, Map, CalendarDays, Wallet, Ticket, Backpack, MapPin, NotebookPen, Settings,
  FileText, LifeBuoy, Search, Sun, Moon, Plus, MoreHorizontal, Plane, ChevronRight,
} from 'lucide-react';
import { useStore } from '../hooks/useStore.jsx';
import { Modal, Button, IconButton } from './ui.jsx';
import { getCountdown } from '../utils/calc.js';
import { TripForm } from './forms.jsx';

export const NAV = [
  { route: 'overview', label: 'Overview', icon: LayoutGrid },
  { route: 'trips', label: 'My Trips', icon: Map },
  { route: 'itinerary', label: 'Itinerary', icon: CalendarDays },
  { route: 'budget', label: 'Budget', icon: Wallet },
  { route: 'bookings', label: 'Bookings', icon: Ticket },
  { route: 'packing', label: 'Packing List', icon: Backpack },
  { route: 'places', label: 'Places', icon: MapPin },
  { route: 'notes', label: 'Notes', icon: NotebookPen },
];
export const ESSENTIALS = [
  { route: 'documents', label: 'Travel Documents', icon: FileText },
  { route: 'emergency', label: 'Emergency Info', icon: LifeBuoy },
];
const MOBILE_MAIN = ['overview', 'itinerary', 'budget', 'packing'];

const activeRoute = (route) => (route === 'tripsettings' ? 'trip' : route);

export function Logo() {
  return (
    <a className="logo" href="#/overview" aria-label="Wanderly home">
      <span className="logo-mark"><Plane size={16} aria-hidden="true" /></span>
      <span className="logo-word">Wanderly</span>
    </a>
  );
}

export function ThemeToggle() {
  const { settings, setSettings } = useStore();
  const dark = settings.theme === 'dark';
  return (
    <IconButton
      icon={dark ? Sun : Moon}
      label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setSettings({ theme: dark ? 'light' : 'dark' })}
    />
  );
}

function NavLink({ item, route }) {
  const Icon = item.icon;
  const on = activeRoute(route) === item.route;
  return (
    <a href={`#/${item.route}`} className={`nav-link ${on ? 'active' : ''}`} aria-current={on ? 'page' : undefined}>
      <Icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
    </a>
  );
}

export function Shell({ children }) {
  const { route, trip, settings, setSearchOpen, openTripModal, storageError, dirty, saveNow } = useStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const cd = trip ? getCountdown(trip) : null;

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);
  useEffect(() => setMoreOpen(false), [route]);

  const more = [NAV[1], NAV[4], NAV[6], NAV[7], ...ESSENTIALS, { route: 'settings', label: 'Settings', icon: Settings }];

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className="sidebar" aria-label="Sidebar">
        <Logo />
        <p className="tagline">Your trip. Your plans. Your adventure.</p>
        {trip && (
          <a className="side-trip" href="#/trip">
            <span className="side-trip-label">Current trip</span>
            <span className="side-trip-name">{trip.name}</span>
            {settings.showCountdown && cd && <span className="side-trip-count">{cd.label}</span>}
            <ChevronRight size={16} className="side-trip-chev" aria-hidden="true" />
          </a>
        )}
        <nav aria-label="Main">
          {NAV.map((n) => <NavLink key={n.route} item={n} route={route} />)}
          <div className="nav-sep" role="presentation" />
          {ESSENTIALS.map((n) => <NavLink key={n.route} item={n} route={route} />)}
        </nav>
        <div className="side-bottom">
          <NavLink item={{ route: 'settings', label: 'Settings', icon: Settings }} route={route} />
        </div>
      </aside>

      <div className="main-col">
        <header className="mobile-bar">
          <Logo />
          <div className="mobile-bar-actions">
            <IconButton icon={Search} label="Search this trip" onClick={() => setSearchOpen(true)} />
            <ThemeToggle />
          </div>
        </header>
        <div className="topbar">
          <button type="button" className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search this trip">
            <Search size={16} aria-hidden="true" />
            <span>Search this trip</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="topbar-actions">
            <ThemeToggle />
            <Button size="sm" icon={Plus} onClick={() => openTripModal()}>New trip</Button>
          </div>
        </div>
        {storageError && (
          <div className="banner banner-warn" role="alert">
            Your browser could not save changes (storage may be full or blocked). Export a backup from Settings so nothing is lost.
          </div>
        )}
        {!settings.autoSave && dirty && (
          <div className="banner" role="status">
            You have unsaved changes. <button type="button" className="link-btn" onClick={saveNow}>Save now</button>
          </div>
        )}
        <main id="main" className="main" tabIndex={-1} key={route}>
          {children}
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Main">
        {MOBILE_MAIN.map((r) => {
          const item = NAV.find((n) => n.route === r);
          const Icon = item.icon;
          const on = activeRoute(route) === r;
          return (
            <a key={r} href={`#/${r}`} className={on ? 'active' : ''} aria-current={on ? 'page' : undefined}>
              <Icon size={21} aria-hidden="true" />
              <span>{item.label === 'Packing List' ? 'Packing' : item.label}</span>
            </a>
          );
        })}
        <button type="button" className={more.some((m) => m.route === route) ? 'active' : ''} onClick={() => setMoreOpen(true)} aria-haspopup="dialog">
          <MoreHorizontal size={21} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <nav className="more-list" aria-label="More pages">
          {more.map((m) => {
            const Icon = m.icon;
            return (
              <a key={m.route} href={`#/${m.route}`} onClick={() => setMoreOpen(false)}>
                <Icon size={18} aria-hidden="true" />
                {m.label}
                <ChevronRight size={16} className="more-chev" aria-hidden="true" />
              </a>
            );
          })}
        </nav>
      </Modal>
    </div>
  );
}

/* ---------------- Create / edit trip modal ---------------- */
export function TripModal() {
  const { tripModal, closeTripModal, createTrip, updateTrip, navigate, toast } = useStore();
  const { open, trip: editing } = tripModal;
  const onSubmit = (values) => {
    if (editing) {
      updateTrip(editing.id, values);
      toast('Trip saved');
    } else {
      createTrip(values);
      toast('Trip saved');
      navigate('trip');
    }
    closeTripModal();
  };
  return (
    <Modal
      open={open}
      onClose={closeTripModal}
      title={editing ? 'Edit trip' : 'Create a new trip'}
      description={editing ? undefined : 'Start with the basics. You can change anything later.'}
      size="lg"
    >
      {open && <TripForm key={editing?.id || 'new'} initial={editing} onSubmit={onSubmit} onCancel={closeTripModal} submitLabel={editing ? 'Save trip' : 'Create trip'} />}
    </Modal>
  );
}
