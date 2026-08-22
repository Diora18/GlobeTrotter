import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listCities } from '../../api/cities';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner';
import { CityCard } from './CityCard';

export function CitySearchModal({ open, onClose, onSelectCity, excludeCityIds = [] }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setRegion('');
      setDebouncedQuery('');
    }
  }, [open]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['cities', debouncedQuery, region],
    queryFn: () =>
      listCities({
        q: debouncedQuery || undefined,
        region: region || undefined,
        sort: debouncedQuery ? undefined : 'popularity',
        limit: 12,
      }),
    enabled: open,
  });

  const cities = (data?.cities || []).filter((city) => !excludeCityIds.includes(city.id));

  return (
    <Modal
      open={open}
      title="Add a Destination City"
      onClose={onClose}
      footer={
        <Button variant="secondary" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="city-search"
            label="Search Cities"
            placeholder="Paris, Tokyo, Rome…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Input
            id="city-region"
            label="Filter Region"
            placeholder="Europe, Asia…"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            Could not load cities. Please try again.
          </p>
        )}

        {!isLoading && !error && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {cities.length === 0 ? (
              <p className="py-6 text-center text-xs font-medium text-slate-500">No cities found.</p>
            ) : (
              cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onSelect={(selected) => {
                    onSelectCity(selected);
                    onClose();
                  }}
                />
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
