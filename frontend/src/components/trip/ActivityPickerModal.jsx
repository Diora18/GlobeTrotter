import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Plus, Check, Sparkles } from 'lucide-react';
import { listActivities, createActivity } from '../../api/activities';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { Input } from '../ui/Input';
import { formatUsd } from '../../utils/currency';
import { eachDayInRange, formatDisplayDate } from '../../utils/dates';
import { getErrorMessage } from '../../api/client';

const CATEGORIES = [
  { label: 'All Types', value: '' },
  { label: 'Sightseeing', value: 'sightseeing' },
  { label: 'Culture', value: 'culture' },
  { label: 'Food', value: 'food' },
  { label: 'Adventure', value: 'adventure' },
];

export function ActivityPickerModal({ open, stop, onClose, onAddActivity }) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Custom activity form state
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customType, setCustomType] = useState('custom');
  const [customCost, setCustomCost] = useState('');
  const [customDuration, setCustomDuration] = useState('60');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customError, setCustomError] = useState('');

  const cityId = stop?.cityId;
  const existingActivityIds = stop?.activities?.map((sa) => sa.activityId) || [];

  const daysList = useMemo(() => {
    if (!stop?.arrivalDate || !stop?.departureDate) return [];
    return eachDayInRange(stop.arrivalDate, stop.departureDate);
  }, [stop]);

  useEffect(() => {
    if (stop?.arrivalDate) {
      setSelectedDay(stop.arrivalDate);
    }
  }, [stop]);

  const activitiesQuery = useQuery({
    queryKey: ['activities', cityId, selectedType, maxCost],
    queryFn: () =>
      listActivities({
        cityId,
        type: selectedType || undefined,
        maxCost: maxCost ? Number(maxCost) : undefined,
      }),
    enabled: Boolean(open && cityId),
  });

  const createActivityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      const newActivity = res.data.activity;
      onAddActivity(newActivity, selectedDay);
      setShowCustomForm(false);
      resetCustomForm();
    },
    onError: (err) => {
      setCustomError(getErrorMessage(err));
    },
  });

  function resetCustomForm() {
    setCustomName('');
    setCustomDescription('');
    setCustomType('custom');
    setCustomCost('');
    setCustomDuration('60');
    setCustomImageUrl('');
    setCustomError('');
  }

  function handleCreateCustom(e) {
    e.preventDefault();
    setCustomError('');

    if (!customName.trim()) {
      setCustomError('Activity name is required');
      return;
    }

    createActivityMutation.mutate({
      cityId,
      name: customName.trim(),
      description: customDescription.trim() || undefined,
      type: customType,
      estimatedCost: customCost ? Number(customCost) : 0,
      durationMinutes: customDuration ? Number(customDuration) : 60,
      imageUrl: customImageUrl.trim() || undefined,
    });
  }

  const activities = activitiesQuery.data?.activities || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={stop ? `Things to do in ${stop.city.name}` : 'Select Activity'}
    >
      <div className="space-y-5">
        {/* Schedule Day Selector */}
        {daysList.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50/80 p-3.5 text-xs border border-sky-200/80">
            <span className="font-bold text-sky-900 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-sky-600" />
              Schedule Activity for Day:
            </span>
            <select
              className="rounded-lg border border-sky-300 bg-white px-3 py-1 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500/20"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
            >
              {daysList.map((day, idx) => (
                <option key={day} value={day}>
                  Day {idx + 1}: {formatDisplayDate(day)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Activity Toggle Button */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                  !showCustomForm && selectedType === cat.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => {
                  setShowCustomForm(false);
                  setSelectedType(cat.value);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <Button
            variant={showCustomForm ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="text-xs shrink-0"
          >
            {showCustomForm ? 'View Catalog' : '+ Create Custom Activity'}
          </Button>
        </div>

        {/* Custom Activity Form */}
        {showCustomForm ? (
          <form onSubmit={handleCreateCustom} className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                Add Custom Activity for {stop?.city.name}
              </h4>
            </div>

            <Input
              id="custom-name"
              label="Activity Name *"
              required
              placeholder="e.g. Sunset Boat Cruise or Dinner at Le Bistro"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                >
                  <option value="custom">Custom</option>
                  <option value="sightseeing">Sightseeing</option>
                  <option value="culture">Culture</option>
                  <option value="food">Food</option>
                  <option value="adventure">Adventure</option>
                </select>
              </div>

              <Input
                id="custom-cost"
                label="Cost ($)"
                type="number"
                min="0"
                placeholder="0"
                value={customCost}
                onChange={(e) => setCustomCost(e.target.value)}
              />

              <Input
                id="custom-duration"
                label="Duration (mins)"
                type="number"
                min="1"
                placeholder="60"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Description (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Short notes or location details..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-sky-500"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
              />
            </div>

            <Input
              id="custom-image"
              label="Image URL (optional)"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
            />

            {customError && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 font-medium">
                {customError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCustomForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? 'Saving…' : 'Save & Add to Itinerary'}
              </Button>
            </div>
          </form>
        ) : (
          /* Activity List */
          activitiesQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : activities.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-500">
              No activities found. Click <strong>+ Create Custom Activity</strong> to add your own experience!
            </div>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {activities.map((act) => {
                const isAdded = existingActivityIds.includes(act.id);
                return (
                  <div
                    key={act.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      {act.imageUrl ? (
                        <img src={act.imageUrl} alt={act.name} className="h-full w-full object-cover" />
                      ) : (
                        <Clock className="h-5 w-5 text-sky-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">{act.name}</h4>
                        <Badge variant="sky" className="text-[9px] px-1.5 py-0 capitalize font-medium">
                          {act.type}
                        </Badge>
                      </div>
                      {act.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{act.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {act.durationMinutes} mins
                        </span>
                        <span>·</span>
                        <span className="text-emerald-600">{formatUsd(act.estimatedCost)}</span>
                      </div>
                    </div>

                    <Button
                      variant={isAdded ? 'ghost' : 'primary'}
                      size="sm"
                      disabled={isAdded}
                      onClick={() => onAddActivity(act, selectedDay)}
                      className="shrink-0"
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
