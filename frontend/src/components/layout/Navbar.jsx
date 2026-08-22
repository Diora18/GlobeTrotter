import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, LayoutDashboard, Map, Plus, LogOut, Shield, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const isCurrentPath = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs transition-transform group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              GlobeTrotter
            </span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                to="/dashboard"
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isCurrentPath('/dashboard')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <LayoutDashboard className="h-4 w-4 text-sky-600" />
                Dashboard
              </Link>
              <Link
                to="/trips"
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isCurrentPath('/trips')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Map className="h-4 w-4 text-emerald-600" />
                My Trips
              </Link>
              <Link
                to="/community"
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  isCurrentPath('/community')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Users className="h-4 w-4 text-amber-600" />
                Community
              </Link>

              {user.isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    isCurrentPath('/admin')
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-purple-700 hover:bg-purple-50 hover:text-purple-900',
                  )}
                >
                  <Shield className="h-4 w-4 text-purple-600" />
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <Link to="/trips/new">
              <Button size="sm" variant="primary">
                <Plus className="h-4 w-4" />
                <span>New Trip</span>
              </Button>
            </Link>

            <div className="h-5 w-[1px] bg-slate-200" />

            <Link
              to="/settings"
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100',
                isCurrentPath('/settings') && 'bg-slate-100 font-semibold text-slate-900',
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline">{user.name}</span>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Log out"
              className="text-slate-500 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
