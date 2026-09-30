import { Component } from 'react';
import { StoreProvider, useStore } from './hooks/useStore.jsx';
import { Shell, TripModal } from './components/Shell.jsx';
import SearchModal from './components/SearchModal.jsx';
import PrintView from './components/PrintView.jsx';
import { ToastHost } from './components/ui.jsx';
import { NoTrip } from './components/Page.jsx';
import Welcome from './pages/Welcome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MyTrips from './pages/MyTrips.jsx';
import TripOverview from './pages/TripOverview.jsx';
import Itinerary from './pages/Itinerary.jsx';
import Budget from './pages/Budget.jsx';
import Bookings from './pages/Bookings.jsx';
import Packing from './pages/Packing.jsx';
import Places from './pages/Places.jsx';
import Notes from './pages/Notes.jsx';
import Documents from './pages/Documents.jsx';
import Emergency from './pages/Emergency.jsx';
import TripSettings from './pages/TripSettings.jsx';
import Settings from './pages/Settings.jsx';

const PAGES = {
  overview: Dashboard,
  trips: MyTrips,
  trip: TripOverview,
  itinerary: Itinerary,
  budget: Budget,
  bookings: Bookings,
  packing: Packing,
  places: Places,
  notes: Notes,
  documents: Documents,
  emergency: Emergency,
  tripsettings: TripSettings,
  settings: Settings,
};
const NEEDS_TRIP = new Set(['overview', 'trip', 'itinerary', 'budget', 'bookings', 'packing', 'places', 'notes', 'documents', 'emergency', 'tripsettings']);

function Router() {
  const { route, trip, trips } = useStore();
  const Page = PAGES[route] || Dashboard;
  if (route === 'overview' && trips.length === 0) return <Welcome />;
  return (
    <Shell>
      {NEEDS_TRIP.has(route) && !trip ? <NoTrip /> : <Page key={trip ? trip.id : 'none'} />}
    </Shell>
  );
}

function Frame() {
  const { trip } = useStore();
  return (
    <>
      <Router />
      <TripModal />
      <SearchModal />
      <ToastHost />
      <PrintView trip={trip} />
    </>
  );
}

class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error('Wanderly error:', err); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="crash">
        <h1>Something went wrong</h1>
        <p>Wanderly hit an unexpected problem. Your saved trips are still on this device. Reload to try again.</p>
        <button type="button" className="btn btn-primary btn-md" onClick={() => { window.location.hash = '/overview'; window.location.reload(); }}>Reload Wanderly</button>
      </div>
    );
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Frame />
      </StoreProvider>
    </ErrorBoundary>
  );
}
