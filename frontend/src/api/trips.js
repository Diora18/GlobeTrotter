import { api } from './client';

export function listTrips(params = {}) {
  const search = new URLSearchParams();
  if (params.sort) search.set('sort', params.sort);
  if (params.limit) search.set('limit', String(params.limit));
  const query = search.toString();
  return api(`/api/trips${query ? `?${query}` : ''}`);
}

export function getTrip(id) {
  return api(`/api/trips/${id}`);
}

export function getSharedTrip(slug) {
  return api(`/api/shared/trips/${slug}`);
}

export function getTripBudget(id) {
  return api(`/api/trips/${id}/budget`);
}

export function createTrip(body) {
  return api('/api/trips', { method: 'POST', body });
}

export function updateTrip(id, body) {
  return api(`/api/trips/${id}`, { method: 'PATCH', body });
}

export function deleteTrip(id) {
  return api(`/api/trips/${id}`, { method: 'DELETE' });
}

export function duplicateTrip(id) {
  return api(`/api/trips/${id}/duplicate`, { method: 'POST' });
}

export function reorderStops(tripId, orderedIds) {
  return api(`/api/trips/${tripId}/stops/reorder`, {
    method: 'PATCH',
    body: { orderedIds },
  });
}
