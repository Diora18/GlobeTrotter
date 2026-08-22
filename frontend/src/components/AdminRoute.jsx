import { Navigate } from 'react-router-dom';
import { Spinner } from './ui/Spinner';
import { useAuth } from '../context/AuthContext';

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
