import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/Input';
import { useMe, useUpdateMe } from '../hooks/useUsers';
import { getErrorMessage } from '../api/client';
import { Spinner } from '../components/ui/Spinner';

export default function ProfileSettingsPage() {
  const { data, isLoading } = useMe();
  const updateMutation = useUpdateMe();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentUser = data?.user || data?.data?.user;

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.phoneNumber) setPhoneNumber(currentUser.phoneNumber);
      if (currentUser.city) setCity(currentUser.city);
      if (currentUser.country) setCountry(currentUser.country);
    }
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await updateMutation.mutateAsync({ name, phoneNumber, city, country });
      setSuccessMessage('Profile updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader title="Profile Settings" description="Manage your personal information, phone number, and location" />

      <div className="mx-auto max-w-xl">
        <Card className="p-6 shadow-sm border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <Input
              id="name"
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              id="email"
              label="Email Address (read-only)"
              type="email"
              disabled
              value={currentUser?.email || ''}
            />

            <Input
              id="phoneNumber"
              label="Phone Number"
              type="tel"
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

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
