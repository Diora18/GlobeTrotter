import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, MapPin, TrendingUp, Plus, Sparkles, ArrowRight, Calendar, Compass } from 'lucide-react';
import { listCities } from '../api/cities';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { CityCard } from '../components/trip/CityCard';
import { TripCard } from '../components/trip/TripCard';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../hooks/useTrips';
import { formatUsd } from '../utils/currency';
import { formatDateRange, tripDayCount } from '../utils/dates';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tripsQuery = useTrips({ sort: 'upcoming', limit: 5 });
  const citiesQuery = useQuery({
    queryKey: ['cities', 'popular'],
    queryFn: () => listCities({ sort: 'popularity', limit: 6 }),
  });

  const trips = tripsQuery.data?.trips || [];
  const cities = citiesQuery.data?.cities || [];

  // Calculate Budget & Trip Highlights
  const totalPlannedBudget = trips.reduce(
    (sum, t) => sum + (t.totalEstimatedCost || 0),
    0,
  );

  const totalStops = trips.reduce(
    (sum, t) => sum + (t.stopCount || 0),
    0,
  );

  const totalDays = trips.reduce((sum, t) => {
    if (!t.startDate || !t.endDate) return sum;
    return sum + tripDayCount(t.startDate, t.endDate);
  }, 0);

  const avgDailySpend = totalDays > 0 ? Math.round(totalPlannedBudget / totalDays) : 0;
  const nextTrip = trips.length > 0 ? trips[0] : null;

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Traveler'}!`}
        description="Plan multi-city trips, explore destinations, track budgets, and visualize your itineraries."
        actions={
          <Link to="/trips/new">
            <Button variant="primary" size="lg">
              <Plus className="h-4 w-4" />
              <span>Plan New Trip</span>
            </Button>
          </Link>
        }
      />

      {/* Budget & Trip Highlights Section */}
      <section className="mb-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-600" />
            Budget & Trip Overview
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Card className="p-5 border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Planned Spend
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {formatUsd(totalPlannedBudget)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Across {trips.length} {trips.length === 1 ? 'active trip' : 'active trips'}
            </p>
          </Card>

          <Card className="p-5 border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Destinations
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {totalStops} {totalStops === 1 ? 'stop' : 'stops'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Across {totalDays} total travel {totalDays === 1 ? 'day' : 'days'}
            </p>
          </Card>

          <Card className="p-5 border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Avg Daily Spend
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-slate-900">
              {formatUsd(avgDailySpend)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Estimated cost per day</p>
          </Card>
        </div>

        {/* Next Trip Spotlight Banner */}
        {nextTrip && (
          <Card className="overflow-hidden border-sky-200 bg-gradient-to-r from-sky-50/80 via-indigo-50/50 to-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="space-y-1.5">
                <Badge variant="sky" className="font-bold">
                  <Compass className="h-3 w-3" /> Next Upcoming Trip
                </Badge>
                <h3 className="text-2xl font-black text-slate-900">{nextTrip.name}</h3>
                <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatDateRange(nextTrip.startDate, nextTrip.endDate)}</span>
                  <span>·</span>
                  <span>{nextTrip.stopCount} {nextTrip.stopCount === 1 ? 'stop' : 'stops'}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {nextTrip.totalEstimatedCost !== undefined && (
                  <div className="text-right hidden sm:block pr-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Budget</p>
                    <p className="text-xl font-black text-emerald-600">{formatUsd(nextTrip.totalEstimatedCost)}</p>
                  </div>
                )}
                <Link to={`/trips/${nextTrip.id}`}>
                  <Button variant="outline" size="sm">View Itinerary</Button>
                </Link>
                <Link to={`/trips/${nextTrip.id}/build`}>
                  <Button variant="primary" size="sm">Edit Plan</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* Your Trips Section */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Your Trips</h2>
          <Link to="/trips" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {tripsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            title="No trips planned yet"
            description="Create your first multi-city itinerary to get started."
            action={
              <Link to="/trips/new">
                <Button variant="primary">Plan New Trip</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Destinations Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Popular Destinations</h2>
            <p className="text-xs text-slate-500">Inspiration for your next adventure</p>
          </div>
        </div>
        {citiesQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                actionLabel="Plan Trip"
                onSelect={(selectedCity) => navigate(`/trips/new?city=${encodeURIComponent(selectedCity.name)}`)}
              />
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
}
