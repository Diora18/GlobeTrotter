import { api } from './client';

export function listActivities(params = {}) {
  const search = new URLSearchParams();
  if (params.cityId) search.set('cityId', params.cityId);
  if (params.type) search.set('type', params.type);
  if (params.maxCost) search.set('maxCost', String(params.maxCost));
  const query = search.toString();
  return api(`/api/activities${query ? `?${query}` : ''}`);
}

export function getActivity(id) {
  return api(`/api/activities/${id}`);
}

export function createActivity(data) {
  return api('/api/activities', {
    method: 'POST',
    body: data,
  });
}
