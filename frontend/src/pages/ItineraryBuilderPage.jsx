import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Plus } from 'lucide-react';
import { createStop, deleteStop } from '../api/stops';
import { addStopActivity, deleteStopActivity, updateStopActivity } from '../api/stopActivities';
import { reorderStops } from '../api/trips';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { CitySearchModal } from '../components/trip/CitySearchModal';
import { StopFormModal } from '../components/trip/StopFormModal';
import { ActivityPickerModal } from '../components/trip/ActivityPickerModal';
import { StopList } from '../components/trip/StopList';
import { useTrip } from '../hooks/useTrips';
import { formatDateRange, tripDayCount } from '../utils/dates';

export default function ItineraryBuilderPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const tripQuery = useTrip(id);

  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stopFormOpen, setStopFormOpen] = useState(false);
  const [activePickerStop, setActivePickerStop] = useState(null);

  const invalidateTrip = () => queryClient.invalidateQueries({ queryKey: ['trip', id] });

  const addStopMutation = useMutation({
    mutationFn: (body) => createStop(id, body),
    onSuccess: invalidateTrip,
  });

  const deleteStopMutation = useMutation({
    mutationFn: deleteStop,
    onSuccess: invalidateTrip,
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedIds) => reorderStops(id, orderedIds),
    onSuccess: invalidateTrip,
  });

  const addActivityMutation = useMutation({
    mutationFn: ({ stopId, body }) => addStopActivity(stopId, body),
    onSuccess: invalidateTrip,
  });

  const updateActivityMutation = useMutation({
    mutationFn: ({ id, body }) => updateStopActivity(id, body),
    onSuccess: invalidateTrip,
  });

  const deleteActivityMutation = useMutation({
    mutationFn: deleteStopActivity,
    onSuccess: invalidateTrip,
  });

  const trip = tripQuery.data?.trip;

  function handleSelectCity(city) {
    setSelectedCity(city);
    setStopFormOpen(true);
  }

  async function handleAddStop(body) {
    await addStopMutation.mutateAsync(body);
    setSelectedCity(null);
  }

  async function handleDeleteStop(stop) {
    const confirmed = window.confirm(`Remove ${stop.city.name} from this trip?`);
    if (!confirmed) return;
    await deleteStopMutation.mutateAsync(stop.id);
  }

  async function handleMoveStop(index, direction) {
    if (!trip?.stops) return;
    const newStops = [...trip.stops];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    await reorderMutation.mutateAsync(newStops.map((stop) => stop.id));
  }

  async function handleAddActivityToStop(activity, selectedDay) {
    if (!activePickerStop) return;
    const scheduledAt = selectedDay ? `${selectedDay}T12:00:00.000Z` : undefined;
    await addActivityMutation.mutateAsync({
      stopId: activePickerStop.id,
      body: {
        activityId: activity.id,
        scheduledAt,
      },
    });
  }

  async function handleUpdateActivityDate(stopActivityId, newDateStr) {
    await updateActivityMutation.mutateAsync({
      id: stopActivityId,
      body: {
        scheduledAt: `${newDateStr}T12:00:00.000Z`,
      },
    });
  }

  async function handleRemoveActivityFromStop(stopActivityId) {
    await deleteActivityMutation.mutateAsync(stopActivityId);
  }

  if (tripQuery.isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  if (tripQuery.isError || !trip) {
    return (
      <AppLayout>
        <EmptyState
          title="Trip not found"
          description="This trip may have been deleted or you do not have access."
          action={
            <Link to="/trips">
              <Button variant="primary">Back to trips</Button>
            </Link>
          }
        />
      </AppLayout>
    );
  }

  const excludeCityIds = trip.stops.map((stop) => stop.cityId);
  const totalDays = tripDayCount(trip.startDate, trip.endDate);

  return (
    <AppLayout>
      <PageHeader
        title={trip.name}
        description={`${formatDateRange(trip.startDate, trip.endDate)} · ${totalDays} total days · ${trip.stops.length} stops`}
        actions={
          <>
            <Link to={`/trips/${trip.id}`}>
              <Button variant="outline">
                <Eye className="h-4 w-4" />
                <span>View Itinerary</span>
              </Button>
            </Link>
            <Button variant="primary" onClick={() => setCitySearchOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Add Stop</span>
            </Button>
          </>
        }
      />

      {trip.description && (
        <p className="-mt-4 mb-6 text-sm text-slate-600 font-medium">{trip.description}</p>
      )}

      <StopList
        stops={trip.stops}
        onMoveUp={(_, index) => handleMoveStop(index, -1)}
        onMoveDown={(_, index) => handleMoveStop(index, 1)}
        onDelete={handleDeleteStop}
        onOpenActivityPicker={(stop) => setActivePickerStop(stop)}
        onRemoveActivity={handleRemoveActivityFromStop}
        onUpdateActivityDate={handleUpdateActivityDate}
      />

      {/* City Search Modal */}
      <CitySearchModal
        open={citySearchOpen}
        onClose={() => setCitySearchOpen(false)}
        onSelectCity={handleSelectCity}
        excludeCityIds={excludeCityIds}
      />

      {/* Stop Form Modal (Dates) */}
      <StopFormModal
        open={stopFormOpen}
        city={selectedCity}
        trip={trip}
        onClose={() => {
          setStopFormOpen(false);
          setSelectedCity(null);
        }}
        onSubmit={handleAddStop}
      />

      {/* Activity Picker Modal */}
      <ActivityPickerModal
        open={Boolean(activePickerStop)}
        stop={activePickerStop}
        onClose={() => setActivePickerStop(null)}
        onAddActivity={handleAddActivityToStop}
      />
    </AppLayout>
  );
}
