import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { TripCard } from '../components/trip/TripCard';
import { useDeleteTrip, useTrips } from '../hooks/useTrips';

export default function TripsPage() {
  const tripsQuery = useTrips({ sort: 'upcoming' });
  const deleteMutation = useDeleteTrip();
  const trips = tripsQuery.data?.trips || [];

  async function handleDelete(trip) {
    const confirmed = window.confirm(`Delete "${trip.name}"? This cannot be undone.`);
    if (!confirmed) return;
    await deleteMutation.mutateAsync(trip.id);
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Trips"
        description="All your upcoming and past travel itineraries in one place"
        actions={
          <Link to="/trips/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" />
              <span>Plan New Trip</span>
            </Button>
          </Link>
        }
      />

      {tripsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : tripsQuery.isError ? (
        <EmptyState
          title="Could not load trips"
          description="Make sure the backend is running and try again."
          action={
            <Button variant="secondary" onClick={() => tripsQuery.refetch()}>
              Retry
            </Button>
          }
        />
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Start planning your next adventure."
          action={
            <Link to="/trips/new">
              <Button variant="primary">Plan New Trip</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
