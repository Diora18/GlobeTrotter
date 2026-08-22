import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { getErrorMessage } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register({ name, email, password, phoneNumber, city, country });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 px-4 py-12">
      <Card className="w-full max-w-lg p-8 shadow-md border-slate-200">
        <div className="mb-8 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Create Account</h1>
          <p className="text-xs font-medium text-slate-500">Join GlobeTrotter to plan and share multi-city trips</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Full Name *"
            type="text"
            autoComplete="name"
            required
            placeholder="Khush Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="email"
              label="Email Address *"
              type="email"
              autoComplete="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              label="Password *"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Input
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 000-0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="city"
              label="Home City"
              type="text"
              placeholder="e.g. New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              id="country"
              label="Country"
              type="text"
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
