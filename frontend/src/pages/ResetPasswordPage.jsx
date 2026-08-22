import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Compass, CheckCircle2, Lock } from 'lucide-react';
import { resetPassword } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 px-4 py-12">
      <Card className="w-full max-w-md p-8 shadow-md border-slate-200">
        <div className="mb-6 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs">
            <Compass className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Set New Password</h1>
          <p className="text-xs font-medium text-slate-500">
            Please enter your new account password below.
          </p>
        </div>

        {success ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Password reset successfully! Redirecting to login…</span>
            </div>
            <Link to="/login" className="block">
              <Button variant="primary" className="w-full">
                Go to Sign In Now
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                Warning: Reset token is missing from the URL.
              </div>
            )}

            <Input
              id="new-password"
              label="New Password"
              type="password"
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              required
              minLength={8}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting || !token}>
              {submitting ? 'Resetting…' : 'Update Password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
