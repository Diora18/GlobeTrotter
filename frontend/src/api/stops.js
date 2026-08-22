import { api } from './client';

export function createStop(tripId, body) {
  return api(`/api/trips/${tripId}/stops`, { method: 'POST', body });
}

export function updateStop(id, body) {
  return api(`/api/stops/${id}`, { method: 'PATCH', body });
}

export function deleteStop(id) {
  return api(`/api/stops/${id}`, { method: 'DELETE' });
}
