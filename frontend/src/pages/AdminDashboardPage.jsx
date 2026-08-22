import { useState } from 'react';
import { Shield, Users, Map, MapPin, Share2, Search, TrendingUp, Calendar } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { useAdminStats, useAdminAnalytics, useAdminUsers, useToggleAdmin } from '../hooks/useAdmin';

export default function AdminDashboardPage() {
  const statsQuery = useAdminStats();
  const analyticsQuery = useAdminAnalytics();
  const usersQuery = useAdminUsers();
  const toggleAdmin = useToggleAdmin();

  const [searchQuery, setSearchQuery] = useState('');

  const isLoading = statsQuery.isLoading || analyticsQuery.isLoading || usersQuery.isLoading;
  const isError = statsQuery.isError || analyticsQuery.isError || usersQuery.isError;

  const stats = statsQuery.data || {};
  const analytics = analyticsQuery.data || {};
  const allUsers = usersQuery.data?.users || [];

  const filteredUsers = allUsers.filter((u) => {
    const query = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
  });

  async function handleToggleAdmin(user) {
    const targetState = !user.isAdmin;
    const actionName = targetState ? 'grant admin privileges to' : 'revoke admin privileges from';
    const confirmed = window.confirm(`Are you sure you want to ${actionName} "${user.name}"?`);
    if (!confirmed) return;

    await toggleAdmin.mutateAsync({ userId: user.id, isAdmin: targetState });
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <EmptyState
          title="Could not load admin analytics"
          description="Make sure you have admin privileges and try again."
          action={
            <Button variant="secondary" onClick={() => { statsQuery.refetch(); analyticsQuery.refetch(); usersQuery.refetch(); }}>
              Retry
            </Button>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Admin & Analytics Dashboard"
        description="Monitor user engagement, destination trends, trip creations, and manage platform roles"
        actions={
          <Badge variant="purple" className="px-3 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 mr-1" />
            <span>Admin Authorized</span>
          </Badge>
        }
      />

      <div className="space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 shadow-xs border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Registered Users</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{stats.totalUsers || 0}</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Platform Travelers</p>
            </div>
          </Card>

          <Card className="p-5 shadow-xs border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Trips Created</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Map className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{stats.totalTrips || 0}</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Multi-city Itineraries</p>
            </div>
          </Card>

          <Card className="p-5 shadow-xs border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">City Stops Planned</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{stats.totalStops || 0}</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Destinations Visited</p>
            </div>
          </Card>

          <Card className="p-5 shadow-xs border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shared Public Trips</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Share2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{stats.publicTripsCount || 0}</span>
              <p className="text-xs font-medium text-slate-500 mt-1">Public Share Links</p>
            </div>
          </Card>
        </div>

        {/* Analytics Breakdown Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Destination Cities */}
          <Card className="p-6 shadow-xs border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-600" />
                <span>Top Destination Cities</span>
              </h2>
              <Badge variant="sky" className="text-xs">Most Added</Badge>
            </div>
            <div className="space-y-3.5">
              {(analytics.topCities || []).length === 0 ? (
                <p className="py-6 text-center text-xs font-medium text-slate-500">No destination data available yet.</p>
              ) : (
                (analytics.topCities || []).map((city, idx) => {
                  const maxStops = analytics.topCities[0]?.stopCount || 1;
                  const pct = Math.round((city.stopCount / maxStops) * 100);

                  return (
                    <div key={city.cityId || idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[200px]">{idx + 1}. {city.name}</span>
                        <span className="text-slate-500 font-medium">{city.stopCount} {city.stopCount === 1 ? 'stop' : 'stops'}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-sky-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Top Scheduled Activities */}
          <Card className="p-6 shadow-xs border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>Top Scheduled Activities</span>
              </h2>
              <Badge variant="emerald" className="text-xs">Popular Experiences</Badge>
            </div>
            <div className="space-y-3">
              {(analytics.topActivities || []).length === 0 ? (
                <p className="py-6 text-center text-xs font-medium text-slate-500">No activity statistics available yet.</p>
              ) : (
                (analytics.topActivities || []).map((act, idx) => (
                  <div key={act.activityId || idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-slate-900 truncate">{act.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{act.cityName}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="capitalize text-[10px]">{act.type}</Badge>
                      <span className="text-xs font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        {act.scheduleCount}x
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Registered Users Directory & Management */}
        <Card className="p-6 shadow-xs border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span>User Directory & Management</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage registered travelers and toggle admin roles</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search travelers..."
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Traveler</th>
                  <th className="pb-3 px-2">Contact & Location</th>
                  <th className="pb-3 px-2 text-center">Trips</th>
                  <th className="pb-3 px-2 text-center">Role</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs font-medium text-slate-500">
                      No registered users found matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs uppercase shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        <p>{u.phoneNumber || '—'}</p>
                        <p className="text-[11px] text-slate-400">
                          {[u.city, u.country].filter(Boolean).join(', ') || 'Location unset'}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900">
                        {u.tripCount || 0}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {u.isAdmin ? (
                          <Badge variant="purple" className="text-[10px]">Admin</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Traveler</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant={u.isAdmin ? 'outline' : 'secondary'}
                          size="sm"
                          disabled={toggleAdmin.isPending}
                          onClick={() => handleToggleAdmin(u)}
                        >
                          {u.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
