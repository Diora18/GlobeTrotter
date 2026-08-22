import { useEffect, useState, useMemo } from 'react';
import { Sparkles, Calendar, DollarSign, Hotel, Plane, Utensils } from 'lucide-react';
import { getErrorMessage } from '../../api/client';
import { formatDisplayDate } from '../../utils/dates';
import { formatUsd } from '../../utils/currency';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/badge';

export function StopFormModal({ open, city, trip, onClose, onSubmit }) {
  const [arrivalDate, setArrivalDate] = useState(trip?.startDate || '');
  const [departureDate, setDepartureDate] = useState(trip?.startDate || '');
  const [estimatedStayCost, setEstimatedStayCost] = useState('');
  const [estimatedTransportCost, setEstimatedTransportCost] = useState('');
  const [estimatedMealCost, setEstimatedMealCost] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute smart budget recommendations based on city cost index and stay duration
  const smartEstimates = useMemo(() => {
    if (!arrivalDate || !departureDate || !city) {
      return { nights: 1, stay: 200, transport: 80, meals: 120, total: 400 };
    }
    const arr = new Date(arrivalDate);
    const dep = new Date(departureDate);
    const ms = dep.getTime() - arr.getTime();
    const nights = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
    const costIdx = city.costIndex || 5;

    const stay = nights * costIdx * 50;
    const transport = Math.max(50, costIdx * 15);
    const meals = nights * costIdx * 20;

    return {
      nights,
      stay,
      transport,
      meals,
      total: stay + transport + meals,
    };
  }, [arrivalDate, departureDate, city]);

  useEffect(() => {
    if (open && trip && city) {
      setArrivalDate(trip.startDate);
      setDepartureDate(trip.startDate);
      // Auto pre-fill smart budget defaults
      const costIdx = city.costIndex || 5;
      setEstimatedStayCost(String(1 * costIdx * 50));
      setEstimatedTransportCost(String(Math.max(50, costIdx * 15)));
      setEstimatedMealCost(String(1 * costIdx * 20));
      setError('');
    }
  }, [open, trip, city]);

  // Recalculate smart costs whenever dates change
  function handleApplySmartEstimates() {
    setEstimatedStayCost(String(smartEstimates.stay));
    setEstimatedTransportCost(String(smartEstimates.transport));
    setEstimatedMealCost(String(smartEstimates.meals));
  }

  if (!city || !trip) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        cityId: city.id,
        arrivalDate,
        departureDate,
        estimatedStayCost: estimatedStayCost ? parseInt(estimatedStayCost, 10) : smartEstimates.stay,
        estimatedTransportCost: estimatedTransportCost ? parseInt(estimatedTransportCost, 10) : smartEstimates.transport,
        estimatedMealCost: estimatedMealCost ? parseInt(estimatedMealCost, 10) : smartEstimates.meals,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title={`Add Stop: ${city.name}, ${city.country}`}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" type="submit" form="stop-form" disabled={submitting}>
            {submitting ? 'Adding Stop…' : 'Add Destination Stop'}
          </Button>
        </div>
      }
    >
      <form id="stop-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 rounded-xl bg-slate-100 p-3 border border-slate-200/60">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-sky-600" />
            Trip Window:
          </span>
          <span className="font-bold text-slate-900">
            {formatDisplayDate(trip.startDate)} – {formatDisplayDate(trip.endDate)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="arrival-date"
            label="Arrival Date"
            type="date"
            required
            min={trip.startDate}
            max={trip.endDate}
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
          />
          <Input
            id="departure-date"
            label="Departure Date"
            type="date"
            required
            min={arrivalDate || trip.startDate}
            max={trip.endDate}
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>

        {/* Smart Automated Budget Recommendation Banner */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <span className="text-xs font-black text-sky-900 uppercase tracking-wider">
                Automated Smart Budget Preview
              </span>
            </div>
            <Badge variant="sky" className="text-[10px]">
              Cost Rating: {city.costIndex}/10
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-sky-100">
              <Hotel className="h-4 w-4 text-sky-600 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 font-medium block">Stay ({smartEstimates.nights}d)</span>
              <span className="font-extrabold text-slate-900">{formatUsd(smartEstimates.stay)}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-sky-100">
              <Plane className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 font-medium block">Transport</span>
              <span className="font-extrabold text-slate-900">{formatUsd(smartEstimates.transport)}</span>
            </div>
            <div className="rounded-xl bg-white p-2.5 shadow-2xs border border-sky-100">
              <Utensils className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <span className="text-[10px] text-slate-500 font-medium block">Meals</span>
              <span className="font-extrabold text-slate-900">{formatUsd(smartEstimates.meals)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-sky-900">
              Auto Total: <strong>{formatUsd(smartEstimates.total)}</strong>
            </span>
            <button
              type="button"
              onClick={handleApplySmartEstimates}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer"
            >
              Apply Smart Estimates
            </button>
          </div>
        </div>

        {/* Cost Customization Inputs */}
        <div className="space-y-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Customize Expenses (Optional Override)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              id="estimated-stay-cost"
              label="Stay ($)"
              type="number"
              min="0"
              placeholder={String(smartEstimates.stay)}
              value={estimatedStayCost}
              onChange={(e) => setEstimatedStayCost(e.target.value)}
            />
            <Input
              id="estimated-transport-cost"
              label="Transport ($)"
              type="number"
              min="0"
              placeholder={String(smartEstimates.transport)}
              value={estimatedTransportCost}
              onChange={(e) => setEstimatedTransportCost(e.target.value)}
            />
            <Input
              id="estimated-meal-cost"
              label="Meals ($)"
              type="number"
              min="0"
              placeholder={String(smartEstimates.meals)}
              value={estimatedMealCost}
              onChange={(e) => setEstimatedMealCost(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}
      </form>
    </Modal>
  );
}
