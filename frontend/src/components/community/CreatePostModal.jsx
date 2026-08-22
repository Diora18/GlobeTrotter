import { useState } from 'react';
import { Star, Sparkles, MapPin, Compass } from 'lucide-react';
import { getErrorMessage } from '../../api/client';
import { useCreateCommunityPost } from '../../hooks/useCommunity';
import { useTrips } from '../../hooks/useTrips';
import { useQuery } from '@tanstack/react-query';
import { listCities } from '../../api/cities';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export function CreatePostModal({ open, onClose }) {
  const createPost = useCreateCommunityPost();
  const tripsQuery = useTrips({ sort: 'recent' });
  const citiesQuery = useQuery({ queryKey: ['cities'], queryFn: () => listCities() });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const myTrips = tripsQuery.data?.trips || [];
  const cities = citiesQuery.data?.cities || [];

  function resetForm() {
    setTitle('');
    setContent('');
    setRating(5);
    setSelectedTripId('');
    setSelectedCityId('');
    setImageUrl('');
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Please provide a title and write your review content.');
      return;
    }

    try {
      await createPost.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        rating,
        tripId: selectedTripId || undefined,
        cityId: selectedCityId || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      resetForm();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal
      open={open}
      title="Share Travel Review & Story"
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            type="submit"
            form="create-post-form"
            disabled={createPost.isPending}
          >
            {createPost.isPending ? 'Publishing…' : 'Publish Review'}
          </Button>
        </div>
      }
    >
      <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="post-title"
          label="Review Title *"
          required
          placeholder="e.g. Unforgettable 5 Days in Paris & Essential Food Tips!"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Rating Stars Selector */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Trip Rating (1 - 5 Stars) *
          </label>
          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 cursor-pointer transition transform hover:scale-110"
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-bold text-slate-700">{rating} / 5 Stars</span>
          </div>
        </div>

        {/* Link to My Trip or City */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Link Your Itinerary (Optional)
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
            >
              <option value="">None (General Review)</option>
              {myTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Tag Destination City (Optional)
            </label>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Review Content & Recommendations *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Share your travel experiences, hidden spots, favorite food, or advice for fellow travelers..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <Input
          id="post-image"
          label="Photo URL (optional)"
          type="url"
          placeholder="https://images.unsplash.com/photo-..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
