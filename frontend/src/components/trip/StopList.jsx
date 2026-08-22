import { ArrowUp, ArrowDown, Plus, Trash2, Calendar, Clock, X, MapPin } from 'lucide-react';
import { eachDayInRange, formatDateRange, formatDisplayDate, tripDayCount } from '../../utils/dates';
import { formatUsd } from '../../utils/currency';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export function StopList({
  stops,
  onMoveUp,
  onMoveDown,
  onDelete,
  onOpenActivityPicker,
  onRemoveActivity,
  onUpdateActivityDate,
  showActions = true,
  emptyMessage = 'No stops yet. Add your first city to begin building the itinerary.',
}) {
  if (!stops.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center text-sm font-medium text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {stops.map((stop, index) => {
        const durationDays = tripDayCount(stop.arrivalDate, stop.departureDate);
        const stopDays = eachDayInRange(stop.arrivalDate, stop.departureDate);

        return (
          <Card key={stop.id} className="p-5 border-slate-200 shadow-2xs transition hover:border-slate-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white font-extrabold text-sm shadow-2xs">
                  {index + 1}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {stop.city.name}, {stop.city.country}
                    </h3>
                    <Badge variant="secondary" className="font-semibold text-xs">
                      {durationDays} {durationDays === 1 ? 'day' : 'days'}
                    </Badge>
                  </div>

                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formatDateRange(stop.arrivalDate, stop.departureDate)}</span>
                  </p>
                </div>
              </div>

              {showActions && (
                <div className="flex flex-wrap items-center gap-2">
                  {onOpenActivityPicker && (
                    <Button variant="secondary" size="sm" onClick={() => onOpenActivityPicker(stop)}>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Activity</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onMoveUp?.(stop, index)}
                    disabled={index === 0}
                    title="Move stop up"
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onMoveDown?.(stop, index)}
                    disabled={index === stops.length - 1}
                    title="Move stop down"
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(stop)}
                    title="Remove stop"
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Assigned Activities Sub-Section */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Activities ({stop.activities?.length || 0})
                </span>
              </div>

              {!stop.activities || stop.activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No activities assigned to this stop yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {stop.activities.map((sa) => {
                    let currentScheduledDay = stop.arrivalDate;
                    if (sa.scheduledAt) {
                      const d = new Date(sa.scheduledAt);
                      const year = d.getUTCFullYear();
                      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                      const date = String(d.getUTCDate()).padStart(2, '0');
                      currentScheduledDay = `${year}-${month}-${date}`;
                    }

                    return (
                      <div
                        key={sa.id}
                        className="flex flex-col justify-between gap-2.5 rounded-xl bg-slate-50/80 p-3 text-xs border border-slate-200/80 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          {sa.activity.imageUrl && (
                            <img
                              src={sa.activity.imageUrl}
                              alt={sa.activity.name}
                              className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate">{sa.activity.name}</span>
                              <Badge variant="sky" className="text-[9px] px-1.5 py-0 capitalize">
                                {sa.activity.type}
                              </Badge>
                            </div>
                            <p className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px]">
                              <span>{formatUsd(sa.effectiveCost ?? sa.activity.estimatedCost)}</span>
                              <span>·</span>
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{sa.activity.durationMinutes} mins</span>
                            </p>
                          </div>

                          {showActions && onRemoveActivity && (
                            <button
                              type="button"
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                              onClick={() => onRemoveActivity(sa.id)}
                              title="Remove activity"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Scheduled Day Picker per Activity */}
                        {showActions && onUpdateActivityDate && (
                          <div className="mt-1 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                            <span className="text-slate-500 font-semibold">Scheduled:</span>
                            <select
                              className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20"
                              value={currentScheduledDay}
                              onChange={(e) => onUpdateActivityDate(sa.id, e.target.value)}
                            >
                              {stopDays.map((day, idx) => (
                                <option key={day} value={day}>
                                  Day {idx + 1} ({formatDisplayDate(day)})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
