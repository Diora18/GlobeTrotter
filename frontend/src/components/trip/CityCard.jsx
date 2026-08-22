import { MapPin, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

export function CityCard({ city, actionLabel = 'Add to trip', onSelect, disabled = false }) {
  return (
    <Card className="flex items-center gap-4 p-4 hover:border-slate-300 transition shadow-2xs">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
        {city.imageUrl ? (
          <img src={city.imageUrl} alt={city.name} className="h-full w-full object-cover" />
        ) : (
          <MapPin className="h-6 w-6 text-sky-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-slate-900 truncate">{city.name}</h4>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
            {city.country}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {city.region} · Cost index: <span className="font-semibold text-slate-700">{city.costIndex}/10</span>
        </p>
      </div>
      {onSelect && (
        <Button variant="secondary" size="sm" onClick={() => onSelect(city)} disabled={disabled}>
          <Plus className="h-3.5 w-3.5" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </Card>
  );
}
