import { useTripBudget, useTrip } from '../../hooks/useTrips';
import { formatUsd } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/dates';
import { Spinner } from '../ui/Spinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function BudgetView({ tripId }) {
  const { data, isLoading, isError, error } = useTripBudget(tripId);
  const tripQuery = useTrip(tripId);

  if (isLoading || tripQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const budget = data?.budget;
  const trip = tripQuery.data?.trip;
  const travelerCount = trip?.travelerCount || 1;

  if (isError || !budget) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        Failed to load budget breakdown. {error?.message || 'Please check your connection and try again.'}
      </div>
    );
  }

  const { byCategory, totalEstimated, averagePerDay, tripDays, alerts, byStop, byDay } = budget;
  const perTravelerCost = Math.round(totalEstimated / Math.max(1, travelerCount));

  const categories = [
    { name: 'Transport', value: byCategory.transport, icon: '✈️', color: 'bg-sky-500', hex: '#0284c7' },
    { name: 'Stay', value: byCategory.stay, icon: '🏨', color: 'bg-emerald-500', hex: '#059669' },
    { name: 'Activities', value: byCategory.activities, icon: '🎯', color: 'bg-orange-500', hex: '#ea580c' },
    { name: 'Meals', value: byCategory.meals, icon: '🍽️', color: 'bg-amber-500', hex: '#eab308' },
  ];

  const chartData = categories.filter((item) => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Estimated Cost
          </span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatUsd(totalEstimated)}</p>
          <p className="mt-1 text-xs text-slate-500">For {travelerCount} {travelerCount === 1 ? 'traveler' : 'travelers'}</p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-800">
            Cost Per Traveler
          </span>
          <p className="mt-2 text-3xl font-extrabold text-sky-950">{formatUsd(perTravelerCost)}</p>
          <p className="mt-1 text-xs text-sky-700 font-medium">Per person calculation</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Per Day
          </span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatUsd(averagePerDay)}</p>
          <p className="mt-1 text-xs text-slate-500">Across {tripDays} total travel days</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Destinations & Stops
          </span>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {byStop.length} {byStop.length === 1 ? 'stop' : 'stops'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Stay & activity breakdown below</p>
        </div>
      </div>

      {/* Visual Chart & Category Progress Bars */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Category Distribution</h3>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hex} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatUsd(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              No estimated costs yet. Add stops or activities to view cost breakdown.
            </div>
          )}
        </section>

        {/* Category Breakdown Progress Bars */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Category Summary</h3>
          <div className="space-y-4">
            {categories.map((cat) => {
              const percentage = totalEstimated > 0 ? Math.round((cat.value / totalEstimated) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatUsd(cat.value)}{' '}
                      <span className="text-xs font-normal text-slate-500">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${cat.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Overbudget Alerts if any */}
      {alerts && alerts.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
            <span>⚠️ Budget Alerts</span>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs text-amber-800">
              {alerts.length} over-budget {alerts.length === 1 ? 'day' : 'days'}
            </span>
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert, i) => (
              <div key={i} className="rounded-xl border border-amber-200 bg-white p-3 text-xs shadow-xs">
                <span className="font-bold text-slate-800">{formatDisplayDate(alert.date)}</span>
                <p className="text-amber-800 font-semibold mt-0.5">Total spend: {formatUsd(alert.amount)}</p>
                <p className="text-amber-600 text-[11px] mt-0.5">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stop Breakdown Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Cost Breakdown By City Stop</h3>
        {byStop.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No stops added yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3">City Stop</th>
                  <th className="pb-3">Stay Duration</th>
                  <th className="pb-3 text-right">Transport</th>
                  <th className="pb-3 text-right">Stay</th>
                  <th className="pb-3 text-right">Activities</th>
                  <th className="pb-3 text-right">Meals</th>
                  <th className="pb-3 text-right">Total Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byStop.map((stop) => (
                  <tr key={stop.stopId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-semibold text-slate-900">{stop.cityName}</td>
                    <td className="py-3 text-slate-600 text-xs">
                      {stop.nights} {stop.nights === 1 ? 'night' : 'nights'}
                    </td>
                    <td className="py-3 text-right text-slate-600">{formatUsd(stop.breakdown.transport)}</td>
                    <td className="py-3 text-right text-slate-600">{formatUsd(stop.breakdown.stay)}</td>
                    <td className="py-3 text-right text-slate-600">{formatUsd(stop.breakdown.activities)}</td>
                    <td className="py-3 text-right text-slate-600">{formatUsd(stop.breakdown.meals)}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{formatUsd(stop.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Daily Cost Breakdown Table */}
      {byDay && byDay.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Daily Estimated Spend</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Transport</th>
                  <th className="pb-3 text-right">Stay</th>
                  <th className="pb-3 text-right">Activities</th>
                  <th className="pb-3 text-right">Meals</th>
                  <th className="pb-3 text-right">Daily Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byDay.map((dayItem) => (
                  <tr key={dayItem.date} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 font-medium text-slate-900">{formatDisplayDate(dayItem.date)}</td>
                    <td className="py-2.5 text-right text-slate-600">{formatUsd(dayItem.breakdown.transport)}</td>
                    <td className="py-2.5 text-right text-slate-600">{formatUsd(dayItem.breakdown.stay)}</td>
                    <td className="py-2.5 text-right text-slate-600">{formatUsd(dayItem.breakdown.activities)}</td>
                    <td className="py-2.5 text-right text-slate-600">{formatUsd(dayItem.breakdown.meals)}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">{formatUsd(dayItem.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
