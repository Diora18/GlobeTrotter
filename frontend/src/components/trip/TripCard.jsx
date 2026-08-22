import { Link } from 'react-router-dom';
import { Calendar, Eye, Edit3, Trash2, MapPin, DollarSign } from 'lucide-react';
import { formatDateRange } from '../../utils/dates';
import { formatUsd } from '../../utils/currency';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';

export function TripCard({ trip, onDelete }) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-slate-200">
      {/* Cover Image Header */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 to-sky-900">
        {trip.coverPhotoUrl ? (
          <img
            src={trip.coverPhotoUrl}
            alt={trip.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-lg">
            {trip.name}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Badges on Cover */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-white/90 text-slate-900 backdrop-blur-xs font-semibold">
            <MapPin className="h-3 w-3 text-sky-600" />
            {trip.stopCount} {trip.stopCount === 1 ? 'stop' : 'stops'}
          </Badge>
          <Badge variant="secondary" className="bg-white/90 text-slate-900 backdrop-blur-xs font-semibold">
            👥 {trip.travelerCount || 1} {trip.travelerCount === 1 ? 'traveler' : 'travelers'}
          </Badge>
        </div>

        {trip.totalEstimatedCost !== undefined && (
          <div className="absolute top-3 right-3">
            <Badge variant="emerald" className="bg-emerald-600 text-white font-bold shadow-xs">
              <DollarSign className="h-3 w-3" />
              {formatUsd(trip.totalEstimatedCost)}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="text-xl font-extrabold tracking-tight text-white drop-shadow-xs line-clamp-1">
            {trip.name}
          </h3>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
        </div>

        {trip.description && (
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {trip.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3.5 gap-2">
        <div className="flex items-center gap-1.5 w-full">
          <Link to={`/trips/${trip.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              View
            </Button>
          </Link>

          <Link to={`/trips/${trip.id}/build`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full text-xs">
              <Edit3 className="h-3.5 w-3.5 text-sky-600" />
              Edit
            </Button>
          </Link>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(trip)}
              title="Delete trip"
              className="h-8 w-8 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
