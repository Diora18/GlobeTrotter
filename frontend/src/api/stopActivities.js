import { api } from './client';

export function addStopActivity(stopId, body) {
  return api(`/api/stops/${stopId}/activities`, {
    method: 'POST',
    body,
  });
}

export function updateStopActivity(id, body) {
  return api(`/api/stop-activities/${id}`, {
    method: 'PATCH',
    body,
  });
}

export function deleteStopActivity(id) {
  return api(`/api/stop-activities/${id}`, {
    method: 'DELETE',
  });
}
