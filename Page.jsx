import { Compass, Plus } from 'lucide-react';
import { Button, EmptyState } from './ui.jsx';
import { useStore } from '../hooks/useStore.jsx';

export function PageHeader({ title, subtitle, children, tripName }) {
  return (
    <header className="page-head">
      <div>
        {tripName && <p className="page-trip">{tripName}</p>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </header>
  );
}

export function NoTrip() {
  const { openTripModal, openDemo } = useStore();
  return (
    <div className="page">
      <EmptyState
        icon={Compass}
        title="Your next adventure starts here."
        text="Create your first trip to begin planning."
        action={
          <div className="btn-row">
            <Button icon={Plus} onClick={() => openTripModal()}>Create your first trip</Button>
            <Button variant="secondary" onClick={openDemo}>Explore demo trip</Button>
          </div>
        }
      />
    </div>
  );
}
