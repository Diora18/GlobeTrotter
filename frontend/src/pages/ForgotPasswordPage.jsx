import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../api/auth';
import { getErrorMessage } from '../api/client';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message || 'Password reset email sent successfully.');
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
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Forgot Password</h1>
          <p className="text-xs font-medium text-slate-500">
            Enter your email to receive a password reset link in your inbox.
          </p>
        </div>

        {successMsg ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 text-xs text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-emerald-900 text-sm">Email Sent to Your Inbox! ✉️</p>
                <p className="text-emerald-800 leading-relaxed">
                  We sent a password reset email directly to <strong>{email}</strong>. Please check your Gmail inbox and click the reset button inside the email.
                </p>
              </div>
            </div>

            <Link to="/login" className="block pt-2">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Sign In</span>
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Sending Email…' : 'Send Reset Email'}
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
