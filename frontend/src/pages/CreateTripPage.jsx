import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { useCreateTrip } from '../hooks/useTrips';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city');

  const createTrip = useCreateTrip();

  const todayStr = new Date().toISOString().split('T')[0];

  const [name, setName] = useState(cityParam ? `Trip to ${cityParam}` : '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelerCount, setTravelerCount] = useState(1);
  const [description, setDescription] = useState(
    cityParam ? `Exploring ${cityParam} and surrounding destinations.` : '',
  );
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (startDate < todayStr) {
      setError('Start date cannot be in the past. Please choose today or a future date.');
      return;
    }

    if (endDate < startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      const { trip } = await createTrip.mutateAsync({
        name,
        startDate,
        endDate,
        travelerCount: Number(travelerCount) || 1,
        description: description || undefined,
        coverPhotoUrl: coverPhotoUrl || undefined,
      });
      navigate(`/trips/${trip.id}/build`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AppLayout>
      <PageHeader
        title="Create a New Trip"
        description="Give your trip a name, date range, and traveler group size. You can add cities and activities next."
        actions={
          <Link to="/trips">
            <Button variant="secondary">Cancel</Button>
          </Link>
        }
      />

      <Card className="mx-auto max-w-2xl p-6 shadow-sm border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="trip-name"
            label="Trip Name *"
            required
            placeholder="e.g. Europe Summer Adventure"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              id="start-date"
              label="Start Date *"
              type="date"
              required
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              id="end-date"
              label="End Date *"
              type="date"
              required
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              id="traveler-count"
              label="Travelers (People) *"
              type="number"
              min="1"
              required
              placeholder="1"
              value={travelerCount}
              onChange={(e) => setTravelerCount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              placeholder="Two weeks exploring historic cities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input
            id="cover-photo"
            label="Cover Photo URL (optional)"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={coverPhotoUrl}
            onChange={(e) => setCoverPhotoUrl(e.target.value)}
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <Button type="submit" variant="primary" size="lg" disabled={createTrip.isPending}>
              {createTrip.isPending ? 'Creating…' : 'Create & Build Itinerary'}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
}
