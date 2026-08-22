import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { useSharedTrip, useDuplicateTrip } from '../hooks/useTrips';
import { useAuth } from '../context/AuthContext';
import { eachDayInRange, formatDateRange, formatDisplayDate, tripDayCount } from '../utils/dates';
import { formatUsd } from '../utils/currency';
import { getErrorMessage } from '../api/client';

function getActivitiesForDay(trip, day) {
  const items = [];
  if (!trip?.stops) return items;

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

export default function PublicItineraryPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const tripQuery = useSharedTrip(slug);
  const duplicateMutation = useDuplicateTrip();

  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');

  const trip = tripQuery.data?.trip;

  const days = useMemo(() => {
    if (!trip) return [];
    return eachDayInRange(trip.startDate, trip.endDate);
  }, [trip]);

  const shareUrl = window.location.href;

  const whatsappUrl = trip
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Check out this travel itinerary for ${trip.name} on GlobeTrotter! ${shareUrl}`,
      )}`
    : '#';

  const twitterUrl = trip
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Check out this travel itinerary for ${trip.name}!`,
      )}&url=${encodeURIComponent(shareUrl)}`
    : '#';

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyTrip() {
    if (!user) {
      navigate(`/login?redirect=/shared/${slug}`);
      return;
    }

    setError('');
    setCopying(true);

    try {
      const response = await duplicateMutation.mutateAsync(trip.id);
      const newTrip = response.trip;
      navigate(`/trips/${newTrip.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCopying(false);
    }
  }

  if (tripQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  if (tripQuery.isError || !trip) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6 lg:px-8">
            <Link to="/" className="text-xl font-bold text-sky-600">
              GlobeTrotter
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState
            title="Trip not found"
            description="This itinerary is either private or does not exist."
            action={
              <Link to="/">
                <Button>Go to Home</Button>
              </Link>
            }
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top Public Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-extrabold text-sky-600">
            GlobeTrotter
          </Link>

          <div className="flex items-center gap-3">
            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <span>🔗</span> {copied ? 'Link Copied!' : 'Copy Link'}
            </button>

            {/* Social Sharing */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              title="Share on WhatsApp"
            >
              WhatsApp
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              title="Share on Twitter / X"
            >
              X / Twitter
            </a>

            {/* Copy Trip CTA */}
            <Button onClick={handleCopyTrip} disabled={copying}>
              {copying ? 'Copying…' : '📋 Copy Trip'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title={trip.name}
          description={`${formatDateRange(trip.startDate, trip.endDate)} · ${tripDayCount(
            trip.startDate,
            trip.endDate,
          )} days · ${trip.stops.length} stops`}
          actions={
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                Shared Public Itinerary
              </span>
              <Button onClick={handleCopyTrip} disabled={copying}>
                {copying ? 'Copying…' : 'Copy to My Trips'}
              </Button>
            </div>
          }
        />

        {trip.description && <p className="-mt-4 mb-6 text-slate-600">{trip.description}</p>}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Read-Only Day-by-Day Timeline */}
        <div className="space-y-6">
          {days.length === 0 ? (
            <EmptyState title="No stops" description="This itinerary has no destinations scheduled yet." />
          ) : (
            days.map((day, dayIndex) => {
              const activeStopsOnDay = trip.stops.filter(
                (stop) => day >= stop.arrivalDate && day <= stop.departureDate,
              );
              const dayActivities = getActivitiesForDay(trip, day);

              return (
                <section key={day} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
                        {dayIndex + 1}
                      </span>
                      <h3 className="font-bold text-slate-900">{formatDisplayDate(day)}</h3>
                    </div>

                    {activeStopsOnDay.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        <span>📍 Location:</span>
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
                            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                          >
                            {stopActivity.activity.imageUrl && (
                              <img
                                src={stopActivity.activity.imageUrl}
                                alt={stopActivity.activity.name}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 truncate">
                                  {stopActivity.activity.name}
                                </span>
                                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-sky-700">
                                  {stopActivity.activity.type}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                📍 {stop.city.name} · ⏱️ {stopActivity.activity.durationMinutes} mins
                              </p>
                            </div>

                            <span className="text-xs font-bold text-slate-700 shrink-0">
                              {formatUsd(stopActivity.effectiveCost ?? stopActivity.activity.estimatedCost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
