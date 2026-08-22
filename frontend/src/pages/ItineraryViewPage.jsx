import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Edit3, Share2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { BudgetView } from '../components/trip/BudgetView';
import { CalendarTab } from '../components/trip/CalendarTab';
import { ShareTripModal } from '../components/trip/ShareTripModal';
import { useTrip } from '../hooks/useTrips';
import { eachDayInRange, formatDateRange, formatDisplayDate, tripDayCount } from '../utils/dates';
import { formatUsd } from '../utils/currency';

function getActivitiesForDay(trip, day) {
  const items = [];

  for (const stop of trip.stops) {
    if (day < stop.arrivalDate || day > stop.departureDate) continue;

    for (const stopActivity of stop.activities) {
      let scheduledDay = null;
      if (stopActivity.scheduledAt) {
        const d = new Date(stopActivity.scheduledAt);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const date = String(d.getUTCDate()).padStart(2, '0');
        scheduledDay = `${year}-${month}-${date}`;
      }
      const activityDay = scheduledDay || stop.arrivalDate;
      if (activityDay === day) {
        items.push({ stop, stopActivity });
      }
    }
  }

  return items;
}

export default function ItineraryViewPage() {
  const { id } = useParams();
  const tripQuery = useTrip(id);
  const [viewMode, setViewMode] = useState('timeline');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const trip = tripQuery.data?.trip;

  const days = useMemo(() => {
    if (!trip) return [];
    return eachDayInRange(trip.startDate, trip.endDate);
  }, [trip]);

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

  const travelerCount = trip.travelerCount || 1;

  return (
    <AppLayout>
      <PageHeader
        title={trip.name}
        description={`${formatDateRange(trip.startDate, trip.endDate)} · ${tripDayCount(trip.startDate, trip.endDate)} days · ${trip.stops.length} stops`}
        actions={
          <>
            <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-2xs">
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('timeline')}
              >
                Timeline
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'by-city' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('by-city')}
              >
                By City
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'budget' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('budget')}
              >
                Budget
              </button>
            </div>

            <Button variant="secondary" onClick={() => setIsShareModalOpen(true)}>
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>

            <Link to={`/trips/${trip.id}/build`}>
              <Button variant="primary">
                <Edit3 className="h-4 w-4" />
                <span>Edit Plan</span>
              </Button>
            </Link>
          </>
        }
      />

      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-3">
        <Badge variant="sky" className="text-xs px-3 py-1 font-bold flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {travelerCount} {travelerCount === 1 ? 'Traveler' : 'Travelers'}
        </Badge>
        {trip.description && <p className="text-sm font-medium text-slate-600">{trip.description}</p>}
      </div>

      {/* Timeline View Mode (Day-by-Day layout) */}
      {viewMode === 'timeline' && (
        <div className="space-y-5">
          {days.length === 0 ? (
            <EmptyState
              title="No stops scheduled"
              description="Add cities to your trip in the builder to see the daily timeline."
              action={
                <Link to={`/trips/${trip.id}/build`}>
                  <Button variant="primary">Open Builder</Button>
                </Link>
              }
            />
          ) : (
            days.map((day, dayIndex) => {
              const activeStopsOnDay = trip.stops.filter(
                (stop) => day >= stop.arrivalDate && day <= stop.departureDate,
              );
              const dayActivities = getActivitiesForDay(trip, day);

              return (
                <Card key={day} className="p-5 border-slate-200 shadow-2xs overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-xs font-extrabold text-white">
                        {dayIndex + 1}
                      </span>
                      <h3 className="font-bold text-slate-900">
                        {formatDisplayDate(day)}
                      </h3>
                    </div>

                    {activeStopsOnDay.length > 0 && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                        <MapPin className="h-3.5 w-3.5 text-sky-600" />
                        <span>{activeStopsOnDay.map((s) => `${s.city.name}, ${s.city.country}`).join(' / ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    {dayActivities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-1">
                        No activities scheduled for this day. Free time to explore or relax!
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {dayActivities.map(({ stop, stopActivity }) => (
                          <div
                            key={stopActivity.id}
                            className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 hover:border-slate-300 transition"
                          >
                            {stopActivity.activity.imageUrl && (
                              <img
                                src={stopActivity.activity.imageUrl}
                                alt={stopActivity.activity.name}
                                className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">
                                  {stopActivity.activity.name}
                                </span>
                                <Badge variant="sky" className="text-[9px] px-1.5 py-0 capitalize">
                                  {stopActivity.activity.type}
                                </Badge>
                              </div>

                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                <span>📍 {stop.city.name}</span>
                                <span>·</span>
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>{stopActivity.activity.durationMinutes} mins</span>
                              </p>
                            </div>

                            <span className="text-xs font-extrabold text-slate-900 shrink-0">
                              {formatUsd(stopActivity.effectiveCost ?? stopActivity.activity.estimatedCost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Grouped by City View Mode */}
      {viewMode === 'by-city' && (
        <div className="space-y-6">
          {trip.stops.length === 0 ? (
            <EmptyState
              title="No stops yet"
              description="Add cities to your trip to see the itinerary grouped by cities."
              action={
                <Link to={`/trips/${trip.id}/build`}>
                  <Button variant="primary">Open Builder</Button>
                </Link>
              }
            />
          ) : (
            trip.stops.map((stop) => (
              <Card key={stop.id} className="overflow-hidden border-slate-200 shadow-2xs">
                {/* City Hero Image Header */}
                <div className="relative h-44 w-full bg-slate-900">
                  <img
                    src={stop.city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'}
                    alt={stop.city.name}
                    className="h-full w-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-5 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <div>
                        <Badge variant="sky" className="mb-1 text-[10px] uppercase font-bold">
                          {stop.city.region}
                        </Badge>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                          {stop.city.name}, {stop.city.country}
                        </h2>
                        <p className="text-xs text-slate-200 font-medium mt-0.5 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-sky-400" />
                          <span>{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                        </p>
                      </div>
                      <div className="text-right text-xs font-bold text-white bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/20 backdrop-blur-xs">
                        <span>Cost Index: {stop.city.costIndex}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span>🏨 Stay Est: <strong>{formatUsd(stop.estimatedStayCost)}</strong></span>
                    <span>·</span>
                    <span>✈️ Transport Est: <strong>{formatUsd(stop.estimatedTransportCost)}</strong></span>
                    <span>·</span>
                    <span>🍽️ Meals Est: <strong>{formatUsd(stop.estimatedMealCost)}</strong></span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                      Scheduled Activities ({stop.activities.length})
                    </h4>
                    {stop.activities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No activities assigned to this stop yet.</p>
                    ) : (
                      <ul className="space-y-3">
                        {stop.activities.map((stopActivity) => (
                          <li
                            key={stopActivity.id}
                            className="flex items-center gap-4 rounded-xl bg-slate-50/80 p-3 border border-slate-200/80 hover:border-slate-300 transition"
                          >
                            {stopActivity.activity.imageUrl && (
                              <img
                                src={stopActivity.activity.imageUrl}
                                alt={stopActivity.activity.name}
                                className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 truncate">
                                  {stopActivity.activity.name}
                                </p>
                                <Badge variant="sky" className="text-[9px] capitalize shrink-0">
                                  {stopActivity.activity.type}
                                </Badge>
                              </div>

                              <p className="text-xs text-slate-500 line-clamp-1">
                                {stopActivity.activity.description}
                                {stopActivity.scheduledAt &&
                                  ` · Scheduled: ${formatDisplayDate(stopActivity.scheduledAt.split('T')[0])}`}
                              </p>
                            </div>

                            <span className="text-sm font-extrabold text-slate-900 shrink-0">
                              {formatUsd(stopActivity.effectiveCost ?? stopActivity.activity.estimatedCost)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Calendar View Mode */}
      {viewMode === 'calendar' && (
        <CalendarTab trip={trip} days={days} getActivitiesForDay={getActivitiesForDay} />
      )}

      {/* Budget Breakdown View Mode */}
      {viewMode === 'budget' && (
        <BudgetView tripId={trip.id} />
      )}

      <ShareTripModal 
        open={isShareModalOpen} 
        trip={trip} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </AppLayout>
  );
}
