import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTrip } from '../../api/trips';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getErrorMessage } from '../../api/client';

export function ShareTripModal({ open, trip, onClose }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareMutation = useMutation({
    mutationFn: (body) => updateTrip(trip.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
    },
  });

  if (!trip) return null;

  const publicUrl = `${window.location.origin}/shared/${trip.shareSlug}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Check out this travel itinerary for ${trip.name} on GlobeTrotter! ${publicUrl}`,
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check out this travel itinerary for ${trip.name}!`,
  )}&url=${encodeURIComponent(publicUrl)}`;

  async function handleToggleShare() {
    setError('');
    setSubmitting(true);
    try {
      const isPublic = !trip.isPublic;
      // Generate a random slug if sharing for the first time
      const shareSlug =
        isPublic && !trip.shareSlug
          ? Math.random().toString(36).substring(2, 10)
          : trip.shareSlug;

      await shareMutation.mutateAsync({ isPublic, shareSlug });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Modal open={open} title="Share Trip" onClose={onClose}>
      <div className="space-y-6">
        <p className="text-slate-600 text-sm">
          Share your itinerary with friends or make it public. Anyone with the link can view your itinerary and copy it to their own account.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <h4 className="font-semibold text-slate-900">Public Link</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {trip.isPublic ? 'Anyone with the link can view this trip.' : 'This trip is currently private.'}
            </p>
          </div>
          <Button
            variant={trip.isPublic ? 'secondary' : 'primary'}
            onClick={handleToggleShare}
            disabled={submitting}
          >
            {trip.isPublic ? 'Make Private' : 'Enable Sharing'}
          </Button>
        </div>

        {trip.isPublic && trip.shareSlug && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sharable URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  className="block w-full flex-1 rounded-xl border border-slate-300 px-3 py-2 text-slate-900 shadow-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                  value={publicUrl}
                  onClick={(e) => e.target.select()}
                />
                <Button variant="secondary" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Social Sharing Quick Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Share Directly
              </label>
              <div className="flex flex-wrap gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <span>💬</span> Share on WhatsApp
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
                >
                  <span>🐦</span> Share on X / Twitter
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
